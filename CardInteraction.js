import Card from './Card.js';

const hand = document.querySelector('.cards-hand');
const cardElements = document.querySelectorAll('.card');
const dropoffLocation = document.querySelector('.dropoff-location-card');
const dropoffIcon = document.querySelector('.dropoff-icon');

const allCardObjects = [];
const cardObjectsInHand = [];

let isHoveringCenterWithCard = false;

const lowestZIndex = 100;
let cardDragging = null;
let centerCard = null;
let mouseX = 0;
let mouseY = 0;

// on window resize, reset card positions
window.addEventListener('resize', () => {
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

        const bottomMiddleScreen = window.innerWidth / 2;
        allCardObjects[index].SetDesiredPosition(bottomMiddleScreen, window.innerHeight);

        card.GetElement().addEventListener('mousedown', (e) => {
            cardDragging ??= card;

            cardObjectsInHand.splice(card.GetIndex(), 1);
            console.log(cardObjectsInHand);
            SetHandPositions();
        });
    });

    SetHandPositions();
}

function SetHandPositions () {
    const middleScreen = window.innerWidth / 2;
    const bottomScreen = window.innerHeight + 100;

    const cardsInHand = cardObjectsInHand.length;
    const distanceBetweenCards = 80;
    const rotationCurve = 20;
    const centerCard = (cardsInHand / 2) - .5;
    
    cardObjectsInHand.forEach((card, index) => {
        const rotation = (index - centerCard) * rotationCurve;
        card.SetBaseRotation(rotation);

        const cardX = middleScreen - centerCard * distanceBetweenCards + (index * distanceBetweenCards);
        const cardY = bottomScreen - card.GetElement().offsetHeight / 2 + Math.abs(centerCard - index) * 50;
        card.SetDesiredPosition(cardX, cardY);

        card.SetIndex(index);
        card.GetElement().style.zIndex = lowestZIndex + index;
    });
}

function DragCard (e, card) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!card) return;
    card.SetBaseRotation(0);
    card.SetDesiredPosition(mouseX, mouseY);
    SetCardDraggingStyle(card);
    ShowDropArrow(true);
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
        DropCardInArea();
    } else {
        PutCardBackInHand(cardDragging);
    }

    cardDragging = null;
    
    HoverDropArea(false);
    ShowDropArrow(false);
}

function PutCardBackInHand (card) {
    cardObjectsInHand.push(card);
    card.GetElement().style.pointerEvents = 'auto';
    card.ResetScale();
    SetHandPositions();
}

function DropCardInArea () {

    if (centerCard) {
        PutCardBackInHand(centerCard);
    }

    cardDragging.GetElement().style.zIndex = 0;
    cardDragging.GetElement().style.pointerEvents = 'none';
    const locationCenter = dropoffLocation.getBoundingClientRect();
    cardDragging.SetDesiredPosition(locationCenter.x + locationCenter.width / 2, locationCenter.y + locationCenter.height / 2);
    cardDragging.SetScale(0.5);
    centerCard = cardDragging;
}

function ShowDropArrow (show) {
    if (show) {
        dropoffIcon.classList.remove('dropoff-icon--hidden');
    } else {
        dropoffIcon.classList.add('dropoff-icon--hidden');
    }
}
function HoverDropArea (hover) {
    isHoveringCenterWithCard = hover;

    if (hover) {
        dropoffLocation.classList.add('dropoff-location-card--hover');
    } else {
        dropoffLocation.classList.remove('dropoff-location-card--hover');
    }
}


function HandleCardDropoffInCenter () {
    dropoffLocation.addEventListener('mouseenter', (e) => {
        if (!cardDragging) return;
        HoverDropArea(true);
    });
    
    dropoffLocation.addEventListener('mouseleave', (e) => {
        if (!cardDragging) return;
        HoverDropArea(false);
    });

}
