import activeCardContainer from './ActiveCardContainer.js';

const dropoffLocationElement = document.querySelector('.dropoff-location-card');
const overlayCoverElement = document.querySelector('.overlay-cover');
const dragCardInfoElement = document.querySelector('.drag-card-info');

// listen for updated card event
document.addEventListener('updatedCard', () => {
    const activeCard = activeCardContainer.GetActiveCard();

    dragCardInfoElement.classList.add("drag-card-info--hidden");
    
    MoveCardContainer ();
    HidePage();
    setTimeout(() => {
        ScrollToTop();
        FadePage();
    }, 500);
});

function MoveCardContainer () {
    dropoffLocationElement.style.position = `fixed`;
    dropoffLocationElement.style.transform = `translate(0, 0)`;
    dropoffLocationElement.style.left = `1rem`;
    dropoffLocationElement.style.top = `1rem`;
}

function HidePage () {
    overlayCoverElement.style.opacity = 1;
}

function FadePage () {
    overlayCoverElement.style.opacity = 0;
}

function ScrollToTop () {
    window.scrollTo(0, 0);
}