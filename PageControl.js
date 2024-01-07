import activeCardContainer from "./ActiveCardContainer.js";

const dropoffLocationElement = document.querySelector(".dropoff-location-card");
const overlayCoverElement = document.querySelector(".overlay-cover");
const dragCardInfoElement = document.querySelector(".drag-card-info");

// listen for updated card event
document.addEventListener("updatedCard", () => {
  const activeCard = activeCardContainer.GetActiveCard();

  dragCardInfoElement.classList.add("drag-card-info--hidden");

  MoveCardContainer();
  HidePage();
  setTimeout(() => {
    ScrollToTop();
    FadePage();
  }, 500);
});

function MoveCardContainer() {
  dropoffLocationElement.classList.add("dropoff-location-card--moved");
}

function HidePage() {
  overlayCoverElement.classList.remove("overlay-cover--hidden");
}

function FadePage() {
  overlayCoverElement.classList.add("overlay-cover--hidden");
}

function ScrollToTop() {
  window.scrollTo(0, 0);
}
