import Card from "./Card.js";
class AciveCardContainer {
    constructor() {
        this.activeCard = null;
    }

    // I'm creating a fake card here because I only need the id
    SetActiveCardFromId(id) {
        this.SetActiveCard(
            new Card(
                null,
                0,
                {
                    x: 0,
                    y: 0,
                },
                id
            ),
            false
        );
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
