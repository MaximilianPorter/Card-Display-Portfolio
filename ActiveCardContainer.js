class AciveCardContainer {
    constructor() {
        this.activeCard = null;
    }
    SetActiveCard(card, isInitialPageLoad = false) {
        this.activeCard = card;
        const updatedCardEvent = new CustomEvent("updatedCard", {
            detail: isInitialPageLoad,
        });
        document.dispatchEvent(updatedCardEvent);
    }
    GetActiveCard() {
        return this.activeCard;
    }
}

const activeCardContainer = new AciveCardContainer();

export default activeCardContainer;
