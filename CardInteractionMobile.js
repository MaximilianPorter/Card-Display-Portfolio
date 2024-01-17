import GetIconMarkup from "./ProjectIconHandler.js";
import activeCardContainer from "./ActiveCardContainer.js";

(async () => {
    const CARD_DATA = await GetCardDataFromJSON();
    const mobileCards = document.querySelector(".mobile-cards");
    CreateCardElements();

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
            const cardImagePathLowRes = cardData.cardImagePathLowRes;

            const iconMarkup = GetIconMarkup(cardData, cardData.type);
            const typeText = cardData.type;

            const cardMarkup = `
        <button 
        class="mobile-card"
        data-id="${cardId}"
        data-type="${typeText}"
        >
          <div class="mobile-card-details">
            ${iconMarkup}
            <p class="mobile-card-name">${cardName}</p>
          </div>
          <img src="${
              cardImagePathLowRes !== "" ? cardImagePathLowRes : cardImagePath
          }" alt="image for section ${cardId}" />
        </button>
        `;

            mobileCards.insertAdjacentHTML("beforeend", cardMarkup);
        });

        const mobileCardElements = document.querySelectorAll(".mobile-card");
        mobileCardElements.forEach((cardElement) => {
            cardElement.addEventListener("click", MobileCardClick);
        });
    }

    function MobileCardClick() {
        const cardId = this.dataset.id;
        activeCardContainer.SetActiveCardFromId(cardId);
    }
})();
