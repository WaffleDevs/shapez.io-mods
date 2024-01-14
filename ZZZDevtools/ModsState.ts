import { FormElementCheckbox } from "core/modal_dialog_forms";
import { MODS } from "mods/modloader";
import { T } from "translations";
import { idToPath } from ".";

const modCheckboxes = {};
const clickTrackers = [];
export const ModsStateExt = ({ $super, $old }) => ({
    getMainContentHTML() {
        let modsHtml = ``;
        MODS.mods.forEach((mod) => {
            const checkbox = new FormElementCheckbox({ id: mod.metadata.id, label: "" });
            modCheckboxes[checkbox.id] = checkbox;
            modsHtml += `
                <div class="mod" id="modDiv${mod.metadata.id}">
                    <div class="mainInfo">
                        <span class="name">${mod.metadata.name}</span>
                        <span class="description">${mod.metadata.description}</span>
                        <a class="website" href="${mod.metadata.website}" target="_blank">${T.mods.modWebsite}</a>
                    </div>
                    <span class="version"><strong>${T.mods.version}</strong>${mod.metadata.version}</span>
                    <span class="author"><strong>${T.mods.author}</strong>${mod.metadata.author}</span>
                    ${checkbox.getHtml().replace("data-formId", "id")}

                </div>
            `;
            checkbox.toggle = async function () {
                modCheckboxes[checkbox.id].value = !modCheckboxes[checkbox.id].value;
                modCheckboxes[checkbox.id].element.classList.toggle("checked", checkbox.value);
                let method;
                if (checkbox.value) method = "enableMod";
                else method = "disableMod";
                console.log(checkbox.value);
                const methodPromise = await ipcRenderer.invoke(method, idToPath[checkbox.id]);
                console.log(idToPath[checkbox.id]);
                const value = await ipcRenderer.invoke("get-disabled", idToPath[checkbox.id]);
                console.log(value);
            };
        });
        return `

            <div class="modsStats">
                ${T.mods.modsInfo}
            </div>

            <div class="modsList">
                ${modsHtml}
           </div>
        `;
    },

    onEnter() {
        const steamLink = this.htmlElement.querySelector(".steamLink");
        if (steamLink) {
            this.trackClicks(steamLink, this.onSteamLinkClicked);
        }
        const openModsFolder = this.htmlElement.querySelector(".openModsFolder");
        if (openModsFolder) {
            this.trackClicks(openModsFolder, this.openModsFolder);
        }
        const browseMods = this.htmlElement.querySelector(".browseMods");
        if (browseMods) {
            this.trackClicks(browseMods, this.openBrowseMods);
        }
        for (const [id, checkbox] of Object.entries(modCheckboxes)) {
            modCheckboxes[id].element = document.getElementById(id);
            console.log(modCheckboxes[id].element);
            this.trackClicks(modCheckboxes[id].element, checkbox.toggle);
        }
    },
});
