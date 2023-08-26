import { MODS } from "mods/modloader";
import { T } from "translations";

export function checkForModDifferencesRep($original, [savegame]) {
    const difference = MODS.computeModDifference(savegame.currentData.mods);

    if (difference.missing.length === 0 && difference.extra.length === 0) {
        return Promise.resolve();
    }

    let dialogHtml = T.dialogs.modsDifference.desc;

    /**
     *
     * @param {import("../savegame/savegame_typedefs").SavegameStoredMods[0]} mod
     */
    function formatMod(mod) {
        return `
                <div class="dialogModsMod">
                    <div class="name">${mod.name}</div>
                    <div class="version">${T.mods.version} ${mod.version}</div>
                    ${
                        mod.website != undefined
                            ? `<button class="website styledButton" onclick="window.open('${mod.website.replace(/"'/, "")}')">${T.mods.modWebsite}</button>`
                            : `<button class="website styledButton">No Website</button>`
                    }

                </div>
            `;
    }

    if (difference.missing.length > 0) {
        dialogHtml += "<h3>" + T.dialogs.modsDifference.missingMods + "</h3>";
        dialogHtml += difference.missing.map(formatMod).join("<br>");
    }

    if (difference.extra.length > 0) {
        dialogHtml += "<h3>" + T.dialogs.modsDifference.newMods + "</h3>";
        dialogHtml += difference.extra.map(formatMod).join("<br>");
    }

    const signals = this.dialogs.showWarning(T.dialogs.modsDifference.title, dialogHtml, ["cancel:good", "continue:bad"]);

    return new Promise((resolve) => {
        signals.continue.add(resolve);
    });
}
