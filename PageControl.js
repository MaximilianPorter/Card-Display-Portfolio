import activeCardContainer from "./ActiveCardContainer.js";

const dropoffLocationElement = document.querySelector(".dropoff-location-card");
const overlayCoverElement = document.querySelector(".overlay-cover");
const dragCardInfoElement = document.querySelector(".drag-card-info");

const cardPageSections = document.querySelectorAll(".card-page-section");

// listen for updated card event
document.addEventListener("updatedCard", (e) => {
  const activeCard = activeCardContainer.GetActiveCard();

  // change url to match card
  const cardId = activeCard.GetId();
  window.history.pushState({}, "", `?card=${cardId}`);

  console.log(activeCard);
  dragCardInfoElement.classList.add("drag-card-info--hidden");

  MoveCardContainer();
  ActivateOverlay();
  setTimeout(() => {
    ScrollToTop();
    RemoveOverlay();
    HideAllPages();
    ShowPage(activeCard.GetId());
  }, 500);
});

function MoveCardContainer() {
  dropoffLocationElement.classList.add("dropoff-location-card--moved");

  setTimeout(() => {
    dropoffLocationElement.classList.add("dropoff-location-card--moved-offscreen");
  }, 600);
}

function ActivateOverlay() {
  overlayCoverElement.classList.remove("overlay-cover--hidden");
}
function RemoveOverlay() {
  overlayCoverElement.classList.add("overlay-cover--hidden");
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
