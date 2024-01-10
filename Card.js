class Card {
    constructor(element, index, position, id) {
        this.element = element;
        this.index = index;
        this.desiredBaseRotation = 0;
        this.currentRotation = 0;
        this.desiredPosition = {
            x: position.x,
            y: position.y,
        };
        this.currentPosition = {
            x: position.x,
            y: position.y,
        };
        this.cardMoveSpeed = 0.1;
        this.desiredScale = 1;
        this.currentScale = 1;
        this.originalScale = 1;
        this.id = id;

        this.followElement = null;

        setInterval(() => {
            this.UpdateMoveToDesiredPosition();
        }, 10);
    }

    GetId = () => this.id;

    SetIndex = (index) => (this.index = index);
    GetIndex = () => this.index;

    SetElement = (element) => (this.element = element);
    GetElement = () => this.element;

    SetBaseRotation = (rotation) => (this.desiredBaseRotation = rotation);
    GetBaseRotation = () => this.desiredBaseRotation;

    SetScale = (scale) => (this.desiredScale = scale);
    ResetScale = () => (this.desiredScale = this.originalScale);

    FollowElement = (element) => (this.followElement = element);
    RemoveFollowElement = () => (this.followElement = null);

    SetDesiredPosition = (x, y) => (this.desiredPosition = { x, y });
    GetDesiredPosition = () => this.desiredPosition;

    UpdateMoveToDesiredPosition() {
        if (this.followElement) {
            const elementRect = this.followElement.getBoundingClientRect();
            const elementCenterX = elementRect.x + elementRect.width / 2;
            const elementCenterY = elementRect.y + elementRect.height / 2;

            this.SetDesiredPosition(elementCenterX, elementCenterY);
        }

        const isAtDesiredPosition =
            this.currentPosition.x === this.desiredPosition.x &&
            this.currentPosition.y === this.desiredPosition.y;
        if (isAtDesiredPosition) return;

        this.currentPosition.x +=
            (this.desiredPosition.x - this.currentPosition.x) * this.cardMoveSpeed;
        this.currentPosition.y +=
            (this.desiredPosition.y - this.currentPosition.y) * this.cardMoveSpeed;

        this.element.style.left = `${this.currentPosition.x}px`;
        this.element.style.top = `${this.currentPosition.y}px`;

        this.#UpdateRotation();
        this.#UpdateScale();

        this.element.style.transform = `
        translate(-50%, -50%) 
        rotate(${this.currentRotation + (this.currentPosition.x - this.desiredPosition.x) / 10}deg)
        scale(${this.currentScale})`;
    }

    #UpdateRotation() {
        const isAtDesiredRotation = this.currentRotation === this.desiredBaseRotation;
        if (isAtDesiredRotation) return;

        this.currentRotation +=
            (this.desiredBaseRotation - this.currentRotation) * this.cardMoveSpeed;
    }

    #UpdateScale() {
        const isAtDesiredScale = this.currentScale === this.desiredScale;
        if (isAtDesiredScale) return;

        this.currentScale += (this.desiredScale - this.currentScale) * this.cardMoveSpeed;
    }
}

export default Card;
