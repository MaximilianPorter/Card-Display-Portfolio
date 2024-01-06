const hand = document.querySelector('.cards-hand');
const cards = document.querySelectorAll('.card');
const dropoffLocation = document.querySelector('.dropoff-location-card');
const dropoffIcon = document.querySelector('.dropoff-icon');

const cardStartingYPosition = 50;
const cardHoverYPosition = 75;
const cardHoverScale = 1.2;
const cardDefaultScale = 1;
const cardMoveSpeed = 0.1;

const cardInHandRotation = (index) => (index - 2) * 15;
const cardInHandYPosition = (index) => cardStartingYPosition - Math.abs(2 - index) * 10;

let cardIndexDragged = null;
let isHoveringCenterWithCard = false;
let existingDroppedCardIndex = null;
let draggingCardPositionX = 0;
let draggingCardPositionY = 0;
let desiredDraggingCardPositionX = 0;
let desiredDraggingCardPositionY = 0;
let mouseX = 0;
let mouseY = 0;

// on window resize, reset card positions
window.addEventListener('resize', () => {
    InitializeCardPositions();
});

function HandleCardsDragBehaviour() {
    cards.forEach((card, index) => {
        card.addEventListener('mousedown', (e) => {
            if (cardIndexDragged !== null) return;
            cardIndexDragged = index;
            SetCardDragStyle(index);

            draggingCardPositionX = e.clientX;
            draggingCardPositionY = e.clientY;
        });
    });

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (cardIndexDragged === null) return;
        desiredDraggingCardPositionX = mouseX;
        desiredDraggingCardPositionY = mouseY;
    });

    document.addEventListener('mouseup', (e) => {
        DropCard();
    });

}
HandleCardsDragBehaviour();

function CreateCardFollowAnimation () {
    setInterval(() => {
        if (cardIndexDragged === null) return;
        draggingCardPositionX += (desiredDraggingCardPositionX - draggingCardPositionX) * cardMoveSpeed;
        draggingCardPositionY += (desiredDraggingCardPositionY - draggingCardPositionY) * cardMoveSpeed;
    
        const card = cards[cardIndexDragged];
        card.style.left = `${draggingCardPositionX}px`;
        card.style.top = `${draggingCardPositionY}px`;
    
        card.style.transform = `translate(-50%, -50%) rotate(${(draggingCardPositionX - desiredDraggingCardPositionX) / 10}deg)`;
    
        dropoffIcon.classList.remove('dropoff-icon--hidden');
    }, 10);
}
CreateCardFollowAnimation();


function DropCard () {
    if (cardIndexDragged === null) return;
    
    const newDroppedCardIndex = cardIndexDragged;
    cardIndexDragged = null;

    if (dropoffLocation.classList.contains('dropoff-location-card--hover')) {
        dropoffLocation.classList.remove('dropoff-location-card--hover');
    }

    if (isHoveringCenterWithCard) {
        isHoveringCenterWithCard = false;

        if (existingDroppedCardIndex !== null) {
            cards[existingDroppedCardIndex].removeAttribute('style');
            document.body.appendChild(cards[existingDroppedCardIndex]);
            ResetCardStyle(existingDroppedCardIndex);
            hand.appendChild(cards[existingDroppedCardIndex]);
        }

        existingDroppedCardIndex = newDroppedCardIndex;
        
        // set parent to dropoff location
        const card = cards[newDroppedCardIndex];
        card.classList.add('card--dropped');
        card.classList.remove('card--dragged');
        desiredDraggingCardPositionX = dropoffLocation.offsetLeft + dropoffLocation.offsetWidth / 2;
        desiredDraggingCardPositionY = dropoffLocation.offsetTop + dropoffLocation.offsetHeight / 2;

        console.log('dropoff');
        return;
    } else {
        ResetCardStyle(newDroppedCardIndex);
    }
}

function SetCardDragStyle (index) {
    const card = cards[index];
    card.classList.add('card--dragged');
}

function ResetCardStyle (index) {
    const card = cards[index];
    card.removeAttribute('style');
    card.classList.remove('card--dragged');
    card.classList.remove('card--dropped');
}


function HandleCardDropoffInCenter () {
    dropoffLocation.addEventListener('mouseenter', (e) => {
        if (cardIndexDragged === null) return;
        isHoveringCenterWithCard = true;
        dropoffLocation.classList.add('dropoff-location-card--hover');
    });
    
    dropoffLocation.addEventListener('mouseleave', (e) => {
        if (cardIndexDragged === null) return;
        isHoveringCenterWithCard = false;
        dropoffLocation.classList.remove('dropoff-location-card--hover');
    });

}
HandleCardDropoffInCenter();