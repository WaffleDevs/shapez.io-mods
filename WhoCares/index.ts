/*
    This mod has code taken from Save my Save. Not all of Save my Save's code and savegame fixes have been implemented, as there are more powerful ones already implemented.
    https://mod.io/g/shapez/m/save-my-save
*/
import { Mod } from "mods/mod";
import { SavegameSerializer } from "savegame/savegame_serializer";
import { SerializerInternal } from "savegame/serializer_internal";
import { SerializerInternalExt } from "./ClassExtensions/SerializerInternal";
import { SavegameSerializerExt } from "./ClassExtensions/SavegameSerializer";
import { MainMenuState } from "states/main_menu";
import { moveToStatePre } from "./PrePostFixes/Pre.GameState.moveToState";
import { GameState } from "core/game_state";
import { SerializedGame } from "savegame/savegame_typedefs";
import { onEnterPost } from "./PrePostFixes/Post.MainMenuState.onEnter";
import { createLogger } from "core/logging";
import { checkForModDifferencesRep } from "./MethodReplacements/MainMenuState.checkForModDifferences";
import { ItemProcessorSystem } from "game/systems/item_processor";
import { startNewChargeRep } from "./MethodReplacements/ItemProcessorSystem.startNewCharge";
import { initMissingBuildingsModule } from "./missingBuildings";
import { deserializePathsRep } from "./MethodReplacements/BeltPath.deserializePaths";
import { BeltSystem } from "game/systems/belt";
import { initializeSettings } from "./settings";

const logger = createLogger("forceload/core");
export const forceLoadExeptionLogger = createLogger("forceload/error");

export default class WhoCares extends Mod {
    public missingBuildingsModule: boolean = false; // Disabled due to WIP
    public latestSavegame: SerializedGame;
    public forceLoad: boolean = false;
    // public WhoCaresSavegameData: Object = {
    // savedEntities: {},
    // };
    override init() {
        if (false) {
            this.settings = {};
            this.saveSettings();
        }
        this.modInterface.registerTranslations("en", {
            dialogs: {
                buttons: { forceload: "ForceLoad" },
            },
        });

        this.modInterface.runBeforeMethod(GameState, "moveToState", moveToStatePre);
        this.modInterface.runAfterMethod(MainMenuState, "onEnter", onEnterPost); // Actually enable the dialog

        this.modInterface.extendClass(SavegameSerializer, SavegameSerializerExt);
        this.modInterface.extendClass(SerializerInternal, SerializerInternalExt);
        this.modInterface.replaceMethod(BeltSystem, "deserializePaths", deserializePathsRep);
        this.modInterface.replaceMethod(ItemProcessorSystem, "startNewCharge", startNewChargeRep);
        this.modInterface.replaceMethod(MainMenuState, "checkForModDifferences", checkForModDifferencesRep);

        this.signals.stateEntered.add((state) => {
            if (state instanceof MainMenuState && !this.settings.seenSmSNotice) {
                //@ts-expect-error
                const { website } = this.dialogs.showInfo(
                    "Notice:",
                    `With the Authors permission, Who Cares now bundles a mod called "Save my Save" by StealthC within. If you would like to visit the webpage for Save my Save, click <a onclick="window.open('https://mod.io/g/shapez/m/save-my-save')">here</a>.`,
                    ["ok:good"]
                );
                this.settings.seenSmSNotice = true;
                this.saveSettings();
            }
        });
        initializeSettings(this);
        if (this.missingBuildingsModule) initMissingBuildingsModule(this);
    }
}
