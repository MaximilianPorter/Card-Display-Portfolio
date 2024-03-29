import Card from "./Card.js";
import activeCardContainer from "./ActiveCardContainer.js";
import GetIconMarkup from "./ProjectIconHandler.js";

(async () => {
    const CARD_DATA = await GetCardDataFromJSON();

    const dropoffLocationElement = document.querySelector(".dropoff-location-card");
    const dropoffIconElement = document.querySelector(".dropoff-icon");
    const cardDraggingHelpText = document.querySelector(".card-dragging-help-text");
    const handElement = document.querySelector(".cards-hand");

    CreateCardElements(); // I do this before I query the .cards so I find all the cards
    const cardElements = document.querySelectorAll(".card"); // then I query the .cards

    const allCardObjects = [];
    const cardObjectsInHand = [];

    const positionSettingsNormal = {
        handHeight: 50, // (50) how high the hand is from the bottom of the screen
        handRotationCurve: 20, // how much each card is rotated from the center of the hand
        cardOffsetHeight: 50, // how much each card is offset from the center of the hand
        cardHoverOffsetHeight: 100, // how much each card is raised when hovered
        distanceBetweenCards: 80, // how far apart each card is in the hand
    };
    const positionSettingsWhenContainerActive = {
        handHeight: 200,
        handRotationCurve: 10,
        cardOffsetHeight: 50,
        cardHoverOffsetHeight: 100,
        distanceBetweenCards: 40,
    };

    let currentPositionSettings = positionSettingsNormal; // I do this to change values on the fly if I need to
    const lowestZIndex = 100; // im adjusting z index manually because I procedurally stack the cards in the hand

    // variables not to touch
    let hoverCardHelpTimeout = null;
    let isHoveringCenterWithCard = false;
    let cardDragging = null;
    let cardHovering = null;
    let centerCard = null;

    CreateCardObjectsFromElements();
    CreateHandFromCardObjects(); // I'm doing this separately because I might want more cards to be added to the hand later
    CreateEvents_CardDragBehaviour();
    CreateEvents_DropAreaHoverBehaviour();

    // used for setting a card as active that the user doens't specifically drag
    function SetActiveCard(card, isInitialPageLoad = false) {
        DragCard_Start(card);
        HoverDropArea(true);
        DropCard(card, isInitialPageLoad);
    }

    //#region SETUP -----------------------------------------------------
    async function GetCardDataFromJSON() {
        const CARD_DATA = await fetch("./CardData.json")
            .then((response) => response.json())
            .then((data) => data);
        return CARD_DATA;
    }
    function CreateCardElements() {
        CARD_DATA.forEach((cardData) => {
            const cardId = cardData.id;
            const cardName = cardData.name;
            const cardImagePath = cardData.cardImagePath;
            const cardImagePathLowRes = cardData.cardImagePathLowRes;

            const iconMarkup = GetIconMarkup(cardData, cardData.type);
            const typeText = cardData.type;

            const cardMarkup = `
        <div class="card" data-id="${cardId}" data-type="${typeText}">
            <img 
            class="card-glow-img" 
            src="${cardImagePathLowRes}" 
            alt="blurred glow background image for the card with an id ${cardId}"
            />
            <div class="card-details">
                ${iconMarkup}
                <p class="card-name">${cardName}</p>
            </div>
            <img 
            class="card-img" 
            src="${cardImagePath}" 
            alt="background image for the card with an id ${cardId}"
            style="
                background-image: url('${cardImagePathLowRes}');
                background-size: cover;
                background-position: center;
                "
            />
            <p class="card-type">${typeText}</p>
        </div>
        `;

            handElement.insertAdjacentHTML("beforeend", cardMarkup);
        });
    }
    function CreateCardObjectsFromElements() {
        cardElements.forEach((card, index) => {
            const cardObject = new Card(
                card,
                index,
                {
                    x: card.offsetLeft,
                    y: card.offsetTop,
                },
                card.dataset.id
            );
            allCardObjects.push(cardObject);

            CreateEvents_CardHoverBehaviour(cardObject);
        });
    }
    function CreateHandFromCardObjects() {
        allCardObjects.forEach((card, index) => {
            // if I want to limit the number of cards in the hand, I can do it here
            // if (index > 5) return;
            cardObjectsInHand.push(card);
        });
        UpdateCardPositionsInHand();

        SetCorrectCardFromUrl();
    }
    function SetCorrectCardFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const cardId = urlParams.get("card");
        if (!cardId) return;

        const cardObject = allCardObjects.find((card) => card.GetId() === cardId);
        if (cardObject) SetActiveCard(cardObject, true);
    }
    //#endregion

    //#region EVENT HANDLERS -----------------------------------------------------
    function CreateEvents_CardDragBehaviour() {
        allCardObjects.forEach((card) => {
            ["mousedown", "touchstart"].forEach((eventName) => {
                card.GetElement().addEventListener(eventName, (e) => {
                    DragCard_Start(card);
                });
            });
        });
        ["mousemove", "touchmove"].forEach((eventName) => {
            document.addEventListener(eventName, (e) => {
                DragCard_Continuous(e, cardDragging);

                AdjustHandPositionFromMouse(e);
            });
        });

        ["mouseup", "touchend"].forEach((eventName) => {
            document.addEventListener(eventName, (e) => {
                DropCard(cardDragging);
            });
        });
    }
    function CreateEvents_CardHoverBehaviour(cardObject) {
        cardObject.GetElement().addEventListener("mouseenter", (e) => {
            if (cardDragging) return;
            cardHovering = cardObject;
            cardObject.SetScale(1.1);
            cardObject.GetElement().classList.add("card--hover");

            hoverCardHelpTimeout = setTimeout(() => {
                ActivateHelpDragText(cardObject);
            }, 1000);

            // did this so when the card is hovered, rather than going straight up, it goes up according to it's orientation
            const cardRotationRadians = cardObject.GetBaseRotation() * (Math.PI / 180);
            const newX =
                cardObject.GetDesiredPosition().x +
                Math.sin(cardRotationRadians) * currentPositionSettings.cardHoverOffsetHeight;
            const newY =
                cardObject.GetDesiredPosition().y -
                Math.cos(cardRotationRadians) * currentPositionSettings.cardHoverOffsetHeight;
            cardObject.SetDesiredPosition(newX, newY);
        });
        cardObject.GetElement().addEventListener("mouseleave", (e) => {
            if (cardDragging) return;
            cardHovering = null;
            clearTimeout(hoverCardHelpTimeout);
            ResetHelpDragText();

            cardObject.GetElement().classList.remove("card--hover");
            cardObject.ResetScale();
            UpdateCardPositionsInHand();
        });

        cardObject.GetElement().addEventListener("touchmove", (e) => {
            if (cardObject !== cardDragging) return;

            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            const dropoffLocationRect = dropoffLocationElement.getBoundingClientRect();
            const touchHoveringCenter =
                touchX > dropoffLocationRect.left &&
                touchX < dropoffLocationRect.right &&
                touchY > dropoffLocationRect.top &&
                touchY < dropoffLocationRect.bottom;
            HoverDropArea(touchHoveringCenter);
        });
    }
    function CreateEvents_DropAreaHoverBehaviour() {
        ["mouseenter", "touchenter"].forEach((eventName) => {
            dropoffLocationElement.addEventListener(eventName, (e) => {
                if (!cardDragging) return;
                HoverDropArea(true);
            });
        });

        dropoffLocationElement.addEventListener("mouseleave", (e) => {
            if (!cardDragging) return;
            HoverDropArea(false);
        });
    }
    window.addEventListener("resize", () => {
        UpdateCardPositionsInHand();
    });

    document.addEventListener("updatedCard", (e) => {
        const activeCard = activeCardContainer.GetActiveCard();
        // I do this because sometimes I set the active card just based
        // on the id, and not by dragging it
        if (activeCard.GetElement() === null) {
            console.log("arrived at the page without dragging a card, setting active card");
            // find the card with the same id as the active card
            const cardObject = allCardObjects.find((card) => card.GetId() === activeCard.GetId());
            if (cardObject) SetActiveCard(cardObject, false);
            centerCard = cardObject;
        }
    });
    //#endregion

    //#region HAND POSITIONING -----------------------------------------------------
    function AdjustHandPositionFromMouse(e) {
        const isUsingTouch = e.touches?.length > 0;
        const event = isUsingTouch ? e.touches[0] : e;
        const distanceFromBottom = window.innerHeight - event.clientY;
        if (cardDragging) {
            SetHandPositionSettings(positionSettingsWhenContainerActive);
            return;
        } else if (!centerCard) {
            SetHandPositionSettings(positionSettingsNormal);
            return;
        } else if (distanceFromBottom < 200) {
            SetHandPositionSettings(positionSettingsNormal);
        } else if (distanceFromBottom >= 200 && !cardHovering) {
            SetHandPositionSettings(positionSettingsWhenContainerActive);
        }
    }
    function UpdateCardPositionsInHand() {
        const middleScreen = window.innerWidth / 2;
        const bottomScreen = window.innerHeight + currentPositionSettings.handHeight;

        const cardsInHand = cardObjectsInHand.length;
        const centerCard = cardsInHand / 2 - 0.5;

        cardObjectsInHand.forEach((card, index) => {
            const rotation = (index - centerCard) * currentPositionSettings.handRotationCurve;
            card.SetBaseRotation(rotation);

            const cardX =
                middleScreen -
                centerCard * currentPositionSettings.distanceBetweenCards +
                index * currentPositionSettings.distanceBetweenCards;
            const cardY =
                bottomScreen -
                card.GetElement().offsetHeight / 2 +
                Math.abs(centerCard - index) * currentPositionSettings.cardOffsetHeight;
            card.SetDesiredPosition(cardX, cardY);

            card.SetIndex(index);
            card.GetElement().style.zIndex = lowestZIndex + index + 1;
        });
    }
    function SetHandPositionSettings(settings) {
        if (settings === currentPositionSettings) return;
        currentPositionSettings = settings;
        UpdateCardPositionsInHand();
    }
    //#endregion

    //#region CARD BEHAVIOURS -----------------------------------------------------
    function DragCard_Start(card) {
        cardDragging ??= card;
        card.SetBaseRotation(0);
        SetCardDraggingStyle(card);
        ShowDropIcon(true);
        ShowDropoffLocation();
        ResetHelpDragText();

        RemoveCardFromHand(card);
        UpdateCardPositionsInHand();
    }
    function DragCard_Continuous(e, card) {
        const isUsingTouch = e.touches?.length > 0;
        const event = isUsingTouch ? e.touches[0] : e;
        const mouseX = event.clientX ?? event.clientX;
        const mouseY = event.clientY ?? event.clientY;

        if (!card) return;
        clearTimeout(hoverCardHelpTimeout);
        card.SetDesiredPosition(mouseX, mouseY);
    }
    function DropCard(card, isInitialPageLoad = false) {
        if (!card) return;
        RemoveCardDraggingStyle(card);

        if (isHoveringCenterWithCard) {
            DropCardInContainer(isInitialPageLoad);
        } else {
            PutCardBackInHand(cardDragging);
        }

        cardDragging = null;

        HoverDropArea(false);
        ShowDropIcon(false);
    }
    function PutCardBackInHand(card) {
        HideDropoffLocation();
        card.GetElement().classList.remove("card-in-container");
        card.GetElement().classList.remove("card--hover");
        card.RemoveFollowElement();
        cardObjectsInHand.push(card);
        card.ResetScale();
        UpdateCardPositionsInHand();
    }
    function DropCardInContainer(isInitialPageLoad = false) {
        if (centerCard) {
            PutCardBackInHand(centerCard);
        }

        activeCardContainer.SetActiveCard(cardDragging, isInitialPageLoad);

        cardDragging.GetElement().style.zIndex = lowestZIndex;
        cardDragging.GetElement().classList.add("card-in-container");
        cardDragging.FollowElement(dropoffLocationElement);
        cardDragging.SetScale(0.5);
        centerCard = cardDragging;
    }
    function RemoveCardFromHand(card) {
        cardObjectsInHand.splice(card.GetIndex(), 1);
    }

    //#endregion

    //#region STYLING -----------------------------------------------------
    function SetCardDraggingStyle(card) {
        card.GetElement().classList.add("card-dragging");
        card.GetElement().style.zIndex = 1000;
    }
    function RemoveCardDraggingStyle(card) {
        card.GetElement().classList.remove("card-dragging");
        card.GetElement().style.zIndex = lowestZIndex + card.GetIndex() + 1;
    }

    function ShowDropoffLocation() {
        if (dropoffLocationElement.classList.contains("dropoff-location-card--moved")) {
            dropoffLocationElement.classList.remove("dropoff-location-card--moved-offscreen");
        }
    }
    function HideDropoffLocation() {
        if (dropoffLocationElement.classList.contains("dropoff-location-card--moved")) {
            setTimeout(() => {
                if (cardDragging) return;
                dropoffLocationElement.classList.add("dropoff-location-card--moved-offscreen");
            }, 600);
        }
    }
    function ShowDropIcon(show) {
        if (show) {
            dropoffIconElement.classList.remove("dropoff-icon--hidden");
        } else {
            dropoffIconElement.classList.add("dropoff-icon--hidden");
        }
    }
    function HoverDropArea(hover) {
        isHoveringCenterWithCard = hover;

        if (hover) {
            dropoffLocationElement.classList.add("dropoff-location-card--hover");
        } else {
            dropoffLocationElement.classList.remove("dropoff-location-card--hover");
        }
    }
    function ActivateHelpDragText(cardObject) {
        cardObject.GetElement().appendChild(cardDraggingHelpText);
        cardDraggingHelpText.classList.remove("card-dragging-help-text--hidden");
    }
    function ResetHelpDragText() {
        document.body.appendChild(cardDraggingHelpText);
        cardDraggingHelpText.classList.add("card-dragging-help-text--hidden");
    }
    //#endregion
})();
