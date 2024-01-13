export default function GetIconMarkup(cardData, projectType) {
    const webapp = `<ion-icon class="card-icon" name="laptop-outline"></ion-icon>`;
    const gameIcon = `<ion-icon class="card-icon" name="game-controller-outline"></ion-icon>`;
    const infoIcon = `<ion-icon class="card-icon" name="information-circle-outline"></ion-icon>`;

    let iconMarkup = ``;
    switch (cardData.type) {
        case "Web Application":
            iconMarkup = webapp;
            break;
        case "Game":
            iconMarkup = gameIcon;
            break;
        case "Info":
            iconMarkup = infoIcon;
            break;
    }
    return iconMarkup;
}
