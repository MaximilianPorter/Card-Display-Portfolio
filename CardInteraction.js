import Card from "./Card.js";
import activeCardContainer from "./ActiveCardContainer.js";

(async () => {
  const CARD_DATA = await fetch("./CardData.json")
    .then((response) => response.json())
    .then((data) => data);

  console.log(CARD_DATA);

  const handElement = document.querySelector(".cards-hand");
  CreateCards();
  const cardElements = document.querySelectorAll(".card");
  const dropoffLocationElement = document.querySelector(".dropoff-location-card");
  const dropoffIconElement = document.querySelector(".dropoff-icon");

  const allCardObjects = [];
  const cardObjectsInHand = [];

  const lowestZIndex = 100; // im adjusting z index manually because I procedurally stack the cards in the hand
  const handHeight = 50; // how high the hand is from the bottom of the screen
  const handRotationCurve = 20; // how much each card is rotated from the center of the hand
  const cardOffsetHeight = 50; // how much each card is offset from the center of the hand
  const cardHoverOffsetHeight = 100; // how much each card is raised when hovered
  const distanceBetweenCards = 80; // how far apart each card is in the hand

  let isHoveringCenterWithCard = false;
  let cardDragging = null;
  let centerCard = null;

  // on window resize, reset card positions
  window.addEventListener("resize", () => {
    SetHandPositions();
  });

  // listen for scroll
  window.addEventListener("scroll", () => {
    SetHandPositions();
  });

  HandleCardsDragBehaviour();
  HandleCardDropoffInCenter();

  function CreateCards() {
    CARD_DATA.forEach((cardData) => {
      const cardId = cardData.id;
      const cardName = cardData.name;
      const cardImagePath = cardData.cardImagePath;

      const webapp = `<ion-icon class="card-icon" name="laptop-outline"></ion-icon>`;
      const gameIcon = `<ion-icon class="card-icon" name="game-controller-outline"></ion-icon>`;

      let typeText = ``;
      let iconMarkup = ``;
      if (cardData.type === "webapp") {
        iconMarkup = webapp;
        typeText = `Web App`;
      } else if (cardData.type === "game") {
        iconMarkup = gameIcon;
        typeText = `Game`;
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

  function HandleCardsDragBehaviour() {
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

      AddCardHoverEvents(cardObject);
    });

    SetUpHand();

    document.addEventListener("mousemove", (e) => {
      DragCard(e, cardDragging);
    });

    document.addEventListener("mouseup", (e) => {
      DropCard(cardDragging);
    });
  }

  function AddCardHoverEvents(cardObject) {
    cardObject.GetElement().addEventListener("mouseenter", (e) => {
      if (cardDragging) return;
      cardObject.SetScale(1.1);

      // move card up based on it's own rotation
      const cardRotationRadians = cardObject.GetBaseRotation() * (Math.PI / 180);
      const newX = cardObject.GetDesiredPosition().x + Math.sin(cardRotationRadians) * cardHoverOffsetHeight;
      const newY = cardObject.GetDesiredPosition().y - Math.cos(cardRotationRadians) * cardHoverOffsetHeight;
      cardObject.SetDesiredPosition(newX, newY);
    });
    cardObject.GetElement().addEventListener("mouseleave", (e) => {
      if (cardDragging) return;
      cardObject.ResetScale();
      SetHandPositions();
    });
  }

  function SetUpHand() {
    allCardObjects.forEach((card, index) => {
      if (index >= 5) return;
      cardObjectsInHand.push(card);

      card.GetElement().addEventListener("mousedown", (e) => {
        cardDragging ??= card;

        cardObjectsInHand.splice(card.GetIndex(), 1);
        SetHandPositions();
      });
    });

    SetHandPositions();
  }

  function SetHandPositions() {
    const middleScreen = window.innerWidth / 2;
    const bottomScreen = window.innerHeight + handHeight;

    const cardsInHand = cardObjectsInHand.length;
    const centerCard = cardsInHand / 2 - 0.5;

    cardObjectsInHand.forEach((card, index) => {
      const rotation = (index - centerCard) * handRotationCurve;
      card.SetBaseRotation(rotation);

      const cardX = middleScreen - centerCard * distanceBetweenCards + index * distanceBetweenCards;
      const cardY = bottomScreen - card.GetElement().offsetHeight / 2 + Math.abs(centerCard - index) * cardOffsetHeight;
      card.SetDesiredPosition(cardX, cardY);

      card.SetIndex(index);
      card.GetElement().style.zIndex = lowestZIndex + index + 1;
    });
  }

  function DragCard(e, card) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    if (!card) return;
    card.SetBaseRotation(0);
    card.SetDesiredPosition(mouseX, mouseY);
    SetCardDraggingStyle(card);
    ShowDropIcon(true);
  }

  function SetCardDraggingStyle(card) {
    card.GetElement().classList.add("card-dragging");
    card.GetElement().style.zIndex = 1000;
  }
  function RemoveCardDraggingStyle(card) {
    card.GetElement().classList.remove("card-dragging");
    card.GetElement().style.zIndex = lowestZIndex + card.GetIndex() + 1;
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
    card.GetElement().classList.remove("card-in-container");
    card.RemoveFollowElement();
    cardObjectsInHand.push(card);
    card.ResetScale();
    SetHandPositions();
  }

  function DropCardInContainer() {
    if (centerCard) {
      PutCardBackInHand(centerCard);
    }

    cardDragging.GetElement().style.zIndex = lowestZIndex;
    cardDragging.GetElement().classList.add("card-in-container");
    cardDragging.FollowElement(dropoffLocationElement);
    cardDragging.SetScale(0.5);
    centerCard = cardDragging;

    activeCardContainer.SetActiveCard(cardDragging);
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

  function HandleCardDropoffInCenter() {
    dropoffLocationElement.addEventListener("mouseenter", (e) => {
      if (!cardDragging) return;
      HoverDropArea(true);
    });

    dropoffLocationElement.addEventListener("mouseleave", (e) => {
      if (!cardDragging) return;
      HoverDropArea(false);
    });
  }
})();
