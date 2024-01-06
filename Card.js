class Card {
    constructor(element, index, position) {
        this.element = element;
        this.index = index;
        this.isDragging = false;
        this.isDropped = false;
        this.baseRotation = 0;
        this.desiredPosition = {
            x: position.x,
            y: position.y
        }
        this.currentPosition = {
            x: position.x,
            y: position.y
        }
        this.cardMoveSpeed = 0.1;

        setInterval(() => {
            this.UpdateMoveToDesiredPosition();
        }, 10);
    }

    SetDragging (isDragging) {
        this.isDragging = isDragging;
    }

    SetDropped (isDropped) {
        this.isDropped = isDropped;
    }

    GetIsDragging () {
        return this.isDragging;
    }

    GetIsDropped () {
        return this.isDropped;
    }

    SetIndex (index) {
        this.index = index;
    }

    GetIndex () {
        return this.index;
    }

    SetElement (element) {
        this.element = element;
    }

    GetElement () {
        return this.element;
    }

    SetBaseRotation (rotation) {
        this.baseRotation = rotation;
    }

    SetDesiredPosition (x, y) {
        this.desiredPosition.x = x;
        this.desiredPosition.y = y;
    }

    GetDesiredPosition () {
        return this.desiredPosition;
    }

    UpdateMoveToDesiredPosition () {
        const isAtDesiredPosition = this.currentPosition.x === this.desiredPosition.x && this.currentPosition.y === this.desiredPosition.y;
        if (isAtDesiredPosition) return;

        this.currentPosition.x += (this.desiredPosition.x - this.currentPosition.x) * this.cardMoveSpeed;
        this.currentPosition.y += (this.desiredPosition.y - this.currentPosition.y) * this.cardMoveSpeed;
    
        this.element.style.left = `${this.currentPosition.x}px`;
        this.element.style.top = `${this.currentPosition.y}px`;
    
        this.element.style.transform = `translate(-50%, -50%) rotate(${this.baseRotation + (this.currentPosition.x - this.desiredPosition.x) / 10}deg)`;
    }

    
}

export default Card;