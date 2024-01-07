import Card from './Card.js';
import activeCardContainer from './ActiveCardContainer.js';

const cardElements = document.querySelectorAll('.card');
const dropoffLocationElement = document.querySelector('.dropoff-location-card');
const dropoffIconElement = document.querySelector('.dropoff-icon');

const allCardObjects = [];
const cardObjectsInHand = [];


const lowestZIndex = 100;
const handHeight = 50;
const handRotationCurve = 20;
const cardOffsetHeight = 50;

let isHoveringCenterWithCard = false;
let cardDragging = null;
let centerCard = null;

// on window resize, reset card positions
window.addEventListener('resize', () => {
    SetHandPositions();
});

// listen for scroll
window.addEventListener('scroll', () => {
    SetHandPositions();
});

HandleCardsDragBehaviour();
HandleCardDropoffInCenter();

function HandleCardsDragBehaviour() {
    cardElements.forEach((card, index) => {
        const cardObject = new Card(card, index, {
            x: card.offsetLeft,
            y: card.offsetTop
        });
        allCardObjects.push(cardObject);

        AddHoverEvents(cardObject);
    });

    SetUpHand();

    document.addEventListener('mousemove', (e) => {
        DragCard(e, cardDragging);
    });

    document.addEventListener('mouseup', (e) => {
        DropCard(cardDragging);
    });
}


function AddHoverEvents (cardObject) {
    cardObject.GetElement().addEventListener('mouseenter', (e) => {
        if (cardDragging) return;
        cardObject.SetScale(1.1);
        cardObject.SetDesiredPosition(cardObject.GetDesiredPosition().x, cardObject.GetDesiredPosition().y - 20);
    });
    cardObject.GetElement().addEventListener('mouseleave', (e) => {
        if (cardDragging) return;
        cardObject.ResetScale();
        SetHandPositions();
    });
}


function SetUpHand () {
    allCardObjects.forEach((card, index) => {
        if (index >= 5) return;
        cardObjectsInHand.push(card);

        card.GetElement().addEventListener('mousedown', (e) => {
            cardDragging ??= card;

            cardObjectsInHand.splice(card.GetIndex(), 1);
            SetHandPositions();
        });
    });

    SetHandPositions();
}

function SetHandPositions () {
    const middleScreen = window.innerWidth / 2;
    const bottomWithScroll = window.scrollY + window.innerHeight;
    const bottomScreen = bottomWithScroll + handHeight;

    const cardsInHand = cardObjectsInHand.length;
    const distanceBetweenCards = 80;
    const centerCard = (cardsInHand / 2) - .5;
    
    cardObjectsInHand.forEach((card, index) => {
        const rotation = (index - centerCard) * handRotationCurve;
        card.SetBaseRotation(rotation);

        const cardX = middleScreen - centerCard * distanceBetweenCards + (index * distanceBetweenCards);
        const cardY = bottomScreen - card.GetElement().offsetHeight / 2 + Math.abs(centerCard - index) * cardOffsetHeight;
        card.SetDesiredPosition(cardX, cardY);

        card.SetIndex(index);
        card.GetElement().style.zIndex = lowestZIndex + index;
    });
}

function DragCard (e, card) {
    const mouseX = e.clientX;
    const mouseY = e.clientY + window.scrollY;

    if (!card) return;
    card.SetBaseRotation(0);
    card.SetDesiredPosition(mouseX, mouseY);
    SetCardDraggingStyle(card);
    ShowDropIcon(true);
}

function SetCardDraggingStyle (card) {
    card.GetElement().style.pointerEvents = 'none';
    card.GetElement().classList.add('card-drag-shadow');
    card.GetElement().style.zIndex = 1000;
}
function RemoveCardDraggingStyle (card) {
    card.GetElement().classList.remove('card-drag-shadow');
    card.GetElement().style.zIndex = lowestZIndex + card.GetIndex();
}

function DropCard (card) {
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

function PutCardBackInHand (card) {
    card.RemoveFollowElement();
    cardObjectsInHand.push(card);
    card.GetElement().style.pointerEvents = 'auto';
    card.ResetScale();
    SetHandPositions();
}

function DropCardInContainer () {
    if (centerCard) {
        PutCardBackInHand(centerCard);
    }

    cardDragging.GetElement().style.zIndex = lowestZIndex;
    cardDragging.GetElement().style.pointerEvents = 'none';
    cardDragging.FollowElement(dropoffLocationElement);
    cardDragging.SetScale(0.5);
    centerCard = cardDragging;

    activeCardContainer.SetActiveCard(cardDragging);
}

function ShowDropIcon (show) {
    if (show) {
        dropoffIconElement.classList.remove('dropoff-icon--hidden');
    } else {
        dropoffIconElement.classList.add('dropoff-icon--hidden');
    }
}
function HoverDropArea (hover) {
    isHoveringCenterWithCard = hover;

    if (hover) {
        dropoffLocationElement.classList.add('dropoff-location-card--hover');
    } else {
        dropoffLocationElement.classList.remove('dropoff-location-card--hover');
    }
}


function HandleCardDropoffInCenter () {
    dropoffLocationElement.addEventListener('mouseenter', (e) => {
        if (!cardDragging) return;
        HoverDropArea(true);
    });
    
    dropoffLocationElement.addEventListener('mouseleave', (e) => {
        if (!cardDragging) return;
        HoverDropArea(false);
    });

}
