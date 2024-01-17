import activeCardContainer from "./ActiveCardContainer.js";
import TimeSinceDate from "./DateTimer.js";
import GetIconMarkup from "./ProjectIconHandler.js";
import Card from "./Card.js";

const dropoffLocationElement = document.querySelector(".dropoff-location-card");
const overlayCoverElement = document.querySelector(".overlay-cover");
const dragCardInfoElement = document.querySelector(".drag-card-info");
const startPageCover = document.querySelector(".start-page-cover");
const mobileCardsContainerElement = document.querySelector(".mobile-cards");
const myNameHeaderElement = document.querySelector(".my-name");

// navigation links
const projectNavLinks = document.querySelector(".projects-nav-links");
const projectsDropdownButton = document.querySelector(".projects-dropdown");
const projectsDropdownChevron = document.querySelector(".projects-dropdown-chevron");

const cardPageSections = document.querySelectorAll(".card-page-section");

const age = document.querySelector(".age");
const ageTimer = document.querySelector(".age-timer");
setInterval(() => {
    if (ageTimer) ageTimer.innerHTML = TimeSinceDate(new Date("2016-05-30T00:00:00"), 9);
    if (age) age.innerHTML = TimeSinceDate(new Date("2000-05-30T00:00:00"));
}, 10);

AddProjectsDropdownListener();

// listen for updated card event
document.addEventListener("updatedCard", (e) => {
    const activeCard = activeCardContainer.GetActiveCard();
    const isInitialPageLoad = e.detail;

    // change url to match card
    const cardId = activeCard.GetId();
    window.history.pushState({}, "", `?card=${cardId}`);

    console.log("active card: " + activeCard.GetId());
    projectsDropdownButton.firstElementChild.textContent = activeCard
        .GetElement()
        ?.querySelector(".card-name").textContent;
    dragCardInfoElement.classList.add("drag-card-info--hidden");
    const newNameText = `HOME`;
    myNameHeaderElement.innerHTML = `<a href="/#">${newNameText}</a>`;

    if (isInitialPageLoad === true) {
        MoveCardContainer(isInitialPageLoad);
        ScrollToTop();
        HideAllPages();
        ShowPage(activeCard.GetId());
        startPageCover.classList.add("hidden");
        mobileCardsContainerElement.classList.add("hidden");
        return;
    }

    MoveCardContainer();
    ActivateOverlay();
    setTimeout(() => {
        ScrollToTop();
        HideAllPages();
        ShowPage(activeCard.GetId());
        startPageCover.classList.add("hidden");
        mobileCardsContainerElement.classList.add("hidden");
    }, 500);
    setTimeout(() => {
        RemoveOverlay();
    }, 1000);
});

function MoveCardContainer(instant = false) {
    dropoffLocationElement.classList.add("dropoff-location-card--moved");

    setTimeout(
        () => {
            dropoffLocationElement.classList.add("dropoff-location-card--moved-offscreen");
        },
        instant ? 0 : 500
    );
}

function ActivateOverlay() {
    overlayCoverElement.classList.add("overlay-cover--active");
}
function RemoveOverlay() {
    overlayCoverElement.classList.remove("overlay-cover--active");
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

//#region Project Navigation Dropdown
async function AddProjectsDropdownListener() {
    try {
        const CARD_DATA = await GetCardDataFromJSON();
        CARD_DATA.forEach((cardData, i) => {
            const cardId = cardData.id;
            const cardName = cardData.name;
            const iconMarkup = GetIconMarkup(cardData, cardData.type);

            const navLinkMarkup = `
            <li>
                <a class="nav-link" href="#" data-id="${cardId}">
                    ${iconMarkup}
                    <p>${cardName}</p>
                </a>
            </li>
            `;
            projectNavLinks.insertAdjacentHTML("beforeend", navLinkMarkup);
        });
        projectsDropdownButton.addEventListener("click", () => {
            ToggleNavigationDropdown();
        });
        document.addEventListener("click", (e) => {
            if (e.target.closest(".projects-navigation")) return;
            CloseNavigationDropdown();
        });

        document.querySelectorAll(".nav-link").forEach((link) => {
            link.addEventListener("focus", () => {
                ExpandNavigationDropdown();
            });
            link.addEventListener("click", (e) => {
                e.preventDefault();
                CloseNavigationDropdown();
                projectsDropdownButton.firstElementChild.textContent = link.textContent;
                activeCardContainer.SetActiveCardFromId(link.dataset.id);
            });
        });
    } catch (error) {
        console.log(error);
    }
}
function ToggleNavigationDropdown() {
    projectsDropdownChevron.classList.toggle("projects-dropdown-chevron--active");
    projectNavLinks.classList.toggle("projects-nav-links--active");
}
function ExpandNavigationDropdown() {
    projectsDropdownChevron.classList.add("projects-dropdown-chevron--active");
    projectNavLinks.classList.add("projects-nav-links--active");
}
function CloseNavigationDropdown() {
    projectsDropdownChevron.classList.remove("projects-dropdown-chevron--active");
    projectNavLinks.classList.remove("projects-nav-links--active");
}

async function GetCardDataFromJSON() {
    const CARD_DATA = await fetch("./CardData.json")
        .then((response) => response.json())
        .then((data) => data);
    return CARD_DATA;
}

//#endregion

//#region SCROLLER
const scrollerRows = document.querySelectorAll(".scroller-row");
const scrollingImgsFolder = `./ProjectContent/More/ScrollingImages/`;

const moreSectionScrollerRows = document.querySelectorAll(".more-scroller-images");

moreSectionScrollerRows.forEach((row) => {
    const imagesInFolder = 44;
    for (let i = 0; i < 4; i++) {
        const imgSrc = GetRandomImgSrcFromFolder(scrollingImgsFolder, imagesInFolder);
        const imgMarkup = `<img src="${imgSrc}" alt="scrolling image from video" class="scroller-item" />`;
        row.innerHTML += imgMarkup;
    }
});

scrollerRows.forEach((row) => {
    DuplicateContentInRow(row);
});

function GetRandomImgSrcFromFolder(folder, imagesInFolder) {
    // example: 0001.jpg, 0039.jpg, 0044.jpg
    const randomImageNumber = Math.floor(Math.random() * imagesInFolder) + 1;
    const imgSrc = `${folder}${randomImageNumber.toString().padStart(4, "0")}.jpg`;
    return imgSrc;
}

function DuplicateContentInRow(row) {
    const rowContent = row.innerHTML;
    row.innerHTML += rowContent;
}
//#endregion

//#region Notable Projects (more-games section)
// const notableProjects = document.querySelectorAll(".notable-project");

// notableProjects.forEach((project) => {
//     project.addEventListener("click", () => {
//         if (project.classList.contains("notable-project-selected")) {
//             NotableProject_Deselect();
//         } else {
//             NotableProject_Select(project);
//         }
//     });
// });

// function NotableProject_Select(project) {
//     notableProjects.forEach((p) => {
//         p.classList.add("notable-project-not-selected");
//         p.classList.remove("notable-project-selected");
//     });
//     project.classList.remove("notable-project-not-selected");
//     project.classList.add("notable-project-selected");
// }
// function NotableProject_Deselect() {
//     notableProjects.forEach((p) => {
//         p.classList.remove("notable-project-not-selected");
//         p.classList.remove("notable-project-selected");
//     });
// }
//#endregion

//#region Lazy Load videos/imgs

const videos = document.querySelectorAll("video[data-src]");
let options = {
    rootMargin: "1000px",
    threshold: 0,
};
const videoObserver = new IntersectionObserver((entries, videoObserver) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            console.log(`video ${entry.target.dataset.src} is intersecting`);
            const video = entry.target;
            const videoSrc = video.dataset.src;
            video.src = videoSrc;
            videoObserver.unobserve(video);
        }
    });
}, options);

videos.forEach((video) => {
    videoObserver.observe(video);
});

const imgs = document.querySelectorAll("img");
const imgOptions = {
    rootMargin: "1000px",
    threshold: 0,
};
const originalSrcs = [];
imgs.forEach((img) => {
    if (!img.closest(".card-page-section")) return;
    originalSrcs.push({
        img: img,
        src: img.src,
    });
    img.src = "";
});
const imgObserver = new IntersectionObserver((entries, imgObserver) => {
    entries.forEach((entry) => {
        const img = entry.target;

        const closestCardPageSection = entry.target.closest(".card-page-section:not(.card-page-section--hidden)");
        if (!closestCardPageSection) return;
        if (entry.isIntersecting) {
            console.log(`img ${entry.target.src} is intersecting`);
            img.src = originalSrcs.find((src) => src.img === img).src;
            imgObserver.unobserve(img);
        }
    });
}, imgOptions);

imgs.forEach((img) => {
    imgObserver.observe(img);
});

//#endregion
