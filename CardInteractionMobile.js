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

            const webapp = `<ion-icon class="card-icon" name="laptop-outline"></ion-icon>`;
            const gameIcon = `<ion-icon class="card-icon" name="game-controller-outline"></ion-icon>`;
            const infoIcon = `<ion-icon class="card-icon" name="information-circle-outline"></ion-icon>`;

            let typeText = ``;
            let iconMarkup = ``;
            if (cardData.type === "webapp") {
                iconMarkup = webapp;
                typeText = `Web App`;
            } else if (cardData.type === "game") {
                iconMarkup = gameIcon;
                typeText = `Game`;
            } else if (cardData.type === "info") {
                iconMarkup = infoIcon;
                typeText = `Info`;
            }

            const cardMarkup = `
        <button 
        class="mobile-card"
        data-id="${cardId}"
        data-type="${typeText}"
        onclick = "window.location.href = './?card=${cardId}'"
        >
          <div class="card-details">
          ${iconMarkup}
            <p class="card-name">${cardName}</p>
          </div>
          <img src="${cardImagePath}" alt="example card" />
        </button>
        `;

            mobileCards.insertAdjacentHTML("beforeend", cardMarkup);
        });
    }
})();
