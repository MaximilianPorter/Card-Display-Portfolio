import Card from './Card.js';

const hand = document.querySelector('.cards-hand');
const cardElements = document.querySelectorAll('.card');
const dropoffLocation = document.querySelector('.dropoff-location-card');
const dropoffIcon = document.querySelector('.dropoff-icon');

const allCardObjects = [];
const cardObjectsInHand = [];

let isHoveringCenterWithCard = false;
let cardObjectInMiddle = null;

let cardIndexDragged = null;
let mouseX = 0;
let mouseY = 0;

// on window resize, reset card positions
window.addEventListener('resize', () => {
});

HandleCardsDragBehaviour();
HandleCardDropoffInCenter();

function HandleCardsDragBehaviour() {
    cardElements.forEach((card, index) => {
        allCardObjects.push(new Card(card, index, {
            x: card.offsetLeft,
            y: card.offsetTop
        }));
    });

    SetUpHand();

    document.addEventListener('mousemove', (e) => {
        DragCard(e);
    });

    document.addEventListener('mouseup', (e) => {
        DropCard();
    });
}





function SetUpHand () {
    allCardObjects.forEach((card, index) => {
        if (index >= 5) return;
        cardObjectsInHand.push(card);

        const bottomMiddleScreen = window.innerWidth / 2;
        allCardObjects[index].SetDesiredPosition(bottomMiddleScreen, window.innerHeight);

        card.GetElement().addEventListener('mousedown', (e) => {
            if (cardIndexDragged !== null) return;
            cardIndexDragged = index;
        });
    });

    SetHandPositions();
}

function SetHandPositions () {
    const middleScreen = window.innerWidth / 2;
    const bottomScreen = window.innerHeight;

    const cardsInHand = cardElements.length;
    const distanceBetweenCards = 80;
    const rotationCurve = 20;
    const centerCard = Math.floor (cardsInHand / 2);
    
    cardObjectsInHand.forEach((card, index) => {
        const rotation = (index - centerCard) * rotationCurve;
        card.SetBaseRotation(rotation);

        const cardX = middleScreen - centerCard * distanceBetweenCards + (index * distanceBetweenCards);
        const cardY = bottomScreen - card.GetElement().offsetHeight / 2 + Math.abs(index - centerCard) * 50;
        card.SetDesiredPosition(cardX, cardY);

    });
}

function DragCard (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cardIndexDragged === null) return;
    cardObjectsInHand[cardIndexDragged].SetDesiredPosition(mouseX, mouseY);
    cardObjectsInHand[cardIndexDragged].GetElement().style.pointerEvents = 'none';
    ShowDropArrow(true);
}

function DropCard () {
    if (cardIndexDragged === null) return;
    cardObjectsInHand[cardIndexDragged].GetElement().style.pointerEvents = 'auto';

    if (isHoveringCenterWithCard) {
        DropCardInArea();
    }

    cardIndexDragged = null;
    
    HoverDropArea(false);
    ShowDropArrow(false);
}

function DropCardInArea () {
    cardObjectsInHand[cardIndexDragged].SetDesiredPosition(dropoffLocation.offsetLeft, dropoffLocation.offsetTop);
    cardObjectInMiddle = cardObjectsInHand[cardIndexDragged];
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
        if (cardIndexDragged === null) return;
        HoverDropArea(true);
    });
    
    dropoffLocation.addEventListener('mouseleave', (e) => {
        if (cardIndexDragged === null) return;
        HoverDropArea(false);
    });

}
