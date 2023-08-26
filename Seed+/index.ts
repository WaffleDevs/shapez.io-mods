import { gMetaBuildingRegistry } from "core/global_registries";
import { createLogger } from "core/logging";
import { DialogWithForm } from "core/modal_dialog_elements";
import { FormElementInput } from "core/modal_dialog_forms";
import { randomInt, makeDiv, formatBigNumberFull } from "core/utils";
import { Vector } from "core/vector";
import { MetaHubBuilding } from "game/buildings/hub";
import { BeltComponent } from "game/components/belt";
import { StaticMapEntityComponent } from "game/components/static_map_entity";
import { GameCore } from "game/core";
import { HUDSettingsMenu } from "game/hud/parts/settings_menu";
import { defaultBuildingVariant } from "game/meta_building";
import { Mod } from "mods/mod";
import { MainMenuState } from "states/main_menu";
import { T } from "translations";

const logger = createLogger("state/ingame");

export default class extends Mod {
    override init() {
        let seed = 0;

        this.modInterface.replaceMethod(MainMenuState, "onPlayButtonClicked", function () {
            const textInput = new FormElementInput({
                id: "delayAmount",
                placeholder: "",
                defaultValue: "",
                validator: (val) => (Number.parseInt(val) >= 0 && Number.parseInt(val) <= 2147483647) || val == "" || typeof val === "number",
            });

            const dialog = new DialogWithForm({
                app: this.app,
                title: "Seed",
                desc: "Set the custom seed (0-2147483647) or leave blank for random:",
                formElements: [textInput],
                buttons: ["cancel:bad:escape", "ok:good:enter"],
                closeButton: false,
            });

            this.dialogs.internalShowDialog(dialog);
            //@ts-expect-error
            dialog.buttonSignals.ok.add(() => {
                if (textInput.getValue() != "") seed = Number.parseInt(textInput.getValue());
                else seed = randomInt(0, 2147483647);
                if (this.app.savegameMgr.getSavegamesMetaData().length > 0 && !this.app.restrictionMgr.getHasUnlimitedSavegames()) {
                    this.showSavegameSlotLimit();
                    return;
                }

                this.app.adProvider.showVideoAd().then(() => {
                    const savegame = this.app.savegameMgr.createNewSavegame();

                    this.moveToState("InGameState", {
                        savegame,
                    });
                });
            });
        });

        this.modInterface.replaceMethod(GameCore, "initNewGame", function () {
            this.root.gameIsFresh = true;
            this.root.map.seed = seed;

            if (!this.root.gameMode.hasHub()) {
                return;
            }

            // Place the hub
            const hub = gMetaBuildingRegistry.findByClass(MetaHubBuilding).createEntity({
                root: this.root,
                origin: new Vector(-2, -2),
                rotation: 0,
                originalRotation: 0,
                rotationVariant: 0,
                variant: defaultBuildingVariant,
            });
            this.root.map.placeStaticEntity(hub);
            this.root.entityMgr.registerEntity(hub);
        });

        this.modInterface.replaceMethod(HUDSettingsMenu, "createElements", function ($old, [parent]) {
            this.background = makeDiv(parent, "ingame_HUD_SettingsMenu", ["ingameDialog"]);

            this.menuElement = makeDiv(this.background, null, ["menuElement"]);

            if (this.root.gameMode.hasHub()) {
                this.statsElement = makeDiv(
                    this.background,
                    null,
                    ["statsElement"],
                    `
                <strong>${T.ingame.settingsMenu.beltsPlaced}</strong><span class="beltsPlaced"></span>
                <strong>${T.ingame.settingsMenu.buildingsPlaced}</strong><span class="buildingsPlaced"></span>
                <strong>${T.ingame.settingsMenu.playtime}</strong><span class="playtime"></span>
                <strong>Seed:</strong><span class="seedView"></span>
                `
                );
            }

            this.buttonContainer = makeDiv(this.menuElement, null, ["buttons"]);

            const buttons = [
                {
                    id: "continue",
                    action: () => this.close(),
                },
                {
                    id: "settings",
                    action: () => this.goToSettings(),
                },
                {
                    id: "menu",
                    action: () => this.returnToMenu(),
                },
            ];

            for (let i = 0; i < buttons.length; ++i) {
                const { action, id } = buttons[i];

                const element = document.createElement("button");
                element.classList.add("styledButton");
                element.classList.add(id);
                this.buttonContainer.appendChild(element);

                this.trackClicks(element, action);
            }
        });
        this.modInterface.replaceMethod(HUDSettingsMenu, "show", function () {
            this.visible = true;
            this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);

            const totalMinutesPlayed = Math.ceil(this.root.time.now() / 60);

            if (this.root.gameMode.hasHub()) {
                /** @type {HTMLSpanElement} */
                const playtimeElement = this.statsElement.querySelector(".playtime");
                /** @type {HTMLSpanElement} */
                const buildingsPlacedElement = this.statsElement.querySelector(".buildingsPlaced");
                /** @type {HTMLSpanElement} */
                const beltsPlacedElement = this.statsElement.querySelector(".beltsPlaced");
                /** @type {HTMLSpanElement} */
                const seedViewer = this.statsElement.querySelector(".seedView");

                //@ts-expect-error
                playtimeElement.innerText = T.global.time.xMinutes.replace("<x>", `${totalMinutesPlayed}`);
                //@ts-expect-error
                seedViewer.innerText = formatBigNumberFull(this.root.map.seed);
                //@ts-expect-error
                buildingsPlacedElement.innerText = formatBigNumberFull(
                    this.root.entityMgr.getAllWithComponent(StaticMapEntityComponent).length - this.root.entityMgr.getAllWithComponent(BeltComponent).length
                );

                //@ts-expect-error
                beltsPlacedElement.innerText = formatBigNumberFull(this.root.entityMgr.getAllWithComponent(BeltComponent).length);
            }
        });
    }
}
