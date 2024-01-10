import Card from "./Card.js";
import activeCardContainer from "./ActiveCardContainer.js";

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
        handHeight: 50, // how high the hand is from the bottom of the screen
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
    function SetActiveCard(card) {
        DragCard_Start(card);
        HoverDropArea(true);
        DropCard(card);
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

            const webapp = `<ion-icon class="card-icon" name="laptop-outline"></ion-icon>`;
            const gameIcon = `<ion-icon class="card-icon" name="game-controller-outline"></ion-icon>`;
            const infoIcon = `<ion-icon class="card-icon" name="information-circle-outline"></ion-icon>`;

            let typeText = ``;
            let iconMarkup = ``;
            if (cardData.type === "webapp") {
                iconMarkup = webapp;
                typeText = `Web App`;
            } else if (cardData.type === "game") {
                iconMarkup = gameIcon;
                typeText = `Game`;
            } else if (cardData.type === "info") {
                iconMarkup = infoIcon;
                typeText = `Info`;
            }

            const cardMarkup = `
        <div class="card" data-id="${cardId}" data-type="${typeText}">
          <div class="card-details">
          ${iconMarkup}
            <p class="card-name">${cardName}</p>
          </div>
          <img src="${cardImagePath}" alt="example card" />
        </div>
        `;

            handElement.insertAdjacentHTML("beforeend", cardMarkup);
        });
    }
    function SetCorrectCardFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const cardId = urlParams.get("card");
        if (!cardId) return;

        const cardObject = allCardObjects.find((card) => card.GetId() === cardId);
        if (cardObject) SetActiveCard(cardObject);
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
    //#endregion

    //#region EVENT HANDLERS -----------------------------------------------------
    function CreateEvents_CardDragBehaviour() {
        allCardObjects.forEach((card) => {
            card.GetElement().addEventListener("mousedown", (e) => {
                DragCard_Start(card);
            });
        });
        document.addEventListener("mousemove", (e) => {
            DragCard_Continuous(e, cardDragging);

            AdjustHandPositionFromMouse(e);
        });

        document.addEventListener("mouseup", (e) => {
            DropCard(cardDragging);
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
    }
    function CreateEvents_DropAreaHoverBehaviour() {
        dropoffLocationElement.addEventListener("mouseenter", (e) => {
            if (!cardDragging) return;
            HoverDropArea(true);
        });

        dropoffLocationElement.addEventListener("mouseleave", (e) => {
            if (!cardDragging) return;
            HoverDropArea(false);
        });
    }
    window.addEventListener("resize", () => {
        UpdateCardPositionsInHand();
    });
    //#endregion

    //#region HAND POSITIONING -----------------------------------------------------
    function AdjustHandPositionFromMouse(e) {
        const distanceFromBottom = window.innerHeight - e.clientY;
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
        const mouseX = e?.clientX;
        const mouseY = e?.clientY;

        if (!card) return;
        clearTimeout(hoverCardHelpTimeout);
        card.SetDesiredPosition(mouseX, mouseY);
    }
    function DropCard(card) {
        if (!card) return;
        RemoveCardDraggingStyle(card);

        if (isHoveringCenterWithCard) {
            DropCardInContainer();
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
    function DropCardInContainer() {
        if (centerCard) {
            PutCardBackInHand(centerCard);
        }

        activeCardContainer.SetActiveCard(cardDragging);

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
