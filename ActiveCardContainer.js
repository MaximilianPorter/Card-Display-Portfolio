class AciveCardContainer { 
    constructor() {
        this.activeCard = null;
    }
    SetActiveCard(card) {
        this.activeCard = card;
        document.dispatchEvent(this.#updatedCardEvent);
    }
    GetActiveCard() {
        return this.activeCard;
    }

    #updatedCardEvent = new Event('updatedCard');
}



const activeCardContainer = new AciveCardContainer();

export default activeCardContainer;