import activeCardContainer from "./ActiveCardContainer.js";
import TimeSinceDate from "./DateTimer.js";

const dropoffLocationElement = document.querySelector(".dropoff-location-card");
const overlayCoverElement = document.querySelector(".overlay-cover");
const dragCardInfoElement = document.querySelector(".drag-card-info");
const startPageCover = document.querySelector(".start-page-cover");
const mobileCardsContainerElement = document.querySelector(".mobile-cards");
const myNameHeaderElement = document.querySelector(".my-name");

const cardPageSections = document.querySelectorAll(".card-page-section");

const age = document.querySelector(".age");
const ageTimer = document.querySelector(".age-timer");
setInterval(() => {
    if (ageTimer) ageTimer.innerHTML = TimeSinceDate(new Date("2016-05-30T00:00:00"), 9);
    if (age) age.innerHTML = TimeSinceDate(new Date("2000-05-30T00:00:00"));
}, 10);

// listen for updated card event
document.addEventListener("updatedCard", (e) => {
    const activeCard = activeCardContainer.GetActiveCard();
    const isInitialPageLoad = e.detail;

    // change url to match card
    const cardId = activeCard.GetId();
    window.history.pushState({}, "", `?card=${cardId}`);

    console.log(activeCard);
    dragCardInfoElement.classList.add("drag-card-info--hidden");
    const newNameText = `HOME`;
    myNameHeaderElement.innerHTML = `<a href="/#">${newNameText}</a>`;

    if (isInitialPageLoad === true) {
        MoveCardContainer(isInitialPageLoad);
        ScrollToTop();
        HideAllPages();
        ShowPage(activeCard.GetId());
        startPageCover.classList.add("hidden");
        mobileCardsContainerElement.classList.add("hidden");
        return;
    }

    MoveCardContainer();
    ActivateOverlay();
    setTimeout(() => {
        ScrollToTop();
        HideAllPages();
        ShowPage(activeCard.GetId());
        startPageCover.classList.add("hidden");
        mobileCardsContainerElement.classList.add("hidden");
    }, 500);
    setTimeout(() => {
        RemoveOverlay();
    }, 1000);
});

function MoveCardContainer(instant = false) {
    dropoffLocationElement.classList.add("dropoff-location-card--moved");

    setTimeout(
        () => {
            dropoffLocationElement.classList.add("dropoff-location-card--moved-offscreen");
        },
        instant ? 0 : 500
    );
}

function ActivateOverlay() {
    overlayCoverElement.classList.add("overlay-cover--active");
}
function RemoveOverlay() {
    overlayCoverElement.classList.remove("overlay-cover--active");
}

function HideAllPages() {
    cardPageSections.forEach((section) => {
        section.classList.add("card-page-section--hidden");
    });
}

function ShowPage(pageId) {
    const page = document.querySelector(`.card-page-section[data-id="${pageId}"]`);
    page?.classList.remove("card-page-section--hidden");
}

function ScrollToTop() {
    window.scrollTo(0, 0);
}
