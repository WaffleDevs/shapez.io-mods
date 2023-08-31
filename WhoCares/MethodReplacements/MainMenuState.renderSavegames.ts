import { makeDiv, formatSecondsToTimeAgo } from "core/utils";
import { T } from "translations";
import WhoCares from "..";

export function renderSavegamesRep($original, []) {
    const oldContainer = this.htmlElement.querySelector(".mainContainer .savegames");
    if (oldContainer) {
        oldContainer.remove();
    }
    const games = this.savedGames;
    if (games.length > 0) {
        const parent = makeDiv(this.htmlElement.querySelector(".mainContainer .savegamesMount"), null, ["savegames"]);

        for (let i = 0; i < games.length; ++i) {
            const elem = makeDiv(parent, null, ["savegame"]);

            makeDiv(elem, null, ["playtime"], formatSecondsToTimeAgo((new Date().getTime() - games[i].lastUpdate) / 1000.0));

            makeDiv(elem, null, ["level"], games[i].level ? T.mainMenu.savegameLevel.replace("<x>", "" + games[i].level) : T.mainMenu.savegameLevelUnknown);

            const name = makeDiv(elem, null, ["name"], "<span>" + (games[i].name ? games[i].name : T.mainMenu.savegameUnnamed) + "</span>");

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("styledButton", "deleteGame");
            deleteButton.setAttribute("aria-label", "Delete");
            elem.appendChild(deleteButton);

            const downloadButton = document.createElement("button");
            downloadButton.classList.add("styledButton", "downloadGame");
            downloadButton.setAttribute("aria-label", "Download");
            elem.appendChild(downloadButton);

            const resumeButton = document.createElement("button");
            resumeButton.classList.add("styledButton", "resumeGame");
            resumeButton.setAttribute("aria-label", "Resumee");
            elem.appendChild(resumeButton);

            const forceLoadbutton = document.createElement("button");
            forceLoadbutton.classList.add("styledButton", "forceLoad");
            forceLoadbutton.setAttribute("aria-label", "ForceLoad");
            forceLoadbutton.textContent = "F";
            elem.appendChild(forceLoadbutton);

            this.trackClicks(deleteButton, () => this.deleteGame(games[i]));
            this.trackClicks(downloadButton, () => this.downloadGame(games[i]));
            this.trackClicks(resumeButton, () => this.resumeGame(games[i]));
            this.trackClicks(forceLoadbutton, () => {
                const { forceload } = this.dialogs.showWarning(
                    "Force Load?",
                    "Savegame failed to load. Forceloading may remove any errors and load anyway. This will destroy any data that is invalid. Create a backup before clicking continue.",
                    ["cancel:good", "forceload:bad:timeout"]
                );
                forceload.add(() => {
                    WhoCares.prototype.forceLoad = true;
                    this.resumeGame(games[i]);
                });
            });
        }
    } else {
        const parent = makeDiv(this.htmlElement.querySelector(".mainContainer .savegamesMount"), null, ["savegamesNone"], T.mainMenu.noActiveSavegames);
    }
}
