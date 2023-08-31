/*
    This mod has code taken from Save my Save. Not all of Save my Save's code and savegame fixes have been implemented, as there are more powerful ones already implemented.
    https://mod.io/g/shapez/m/save-my-save
*/
import { GameState } from "core/game_state";
import { createLogger } from "core/logging";
import { BeltSystem } from "game/systems/belt";
import { Mod } from "mods/mod";
import { SavegameSerializer } from "savegame/savegame_serializer";
import { SerializedGame } from "savegame/savegame_typedefs";
import { SerializerInternal } from "savegame/serializer_internal";
import { InGameState } from "states/ingame";
import { MainMenuState } from "states/main_menu";
import { SavegameSerializerExt } from "./ClassExtensions/SavegameSerializer";
import { SerializerInternalExt } from "./ClassExtensions/SerializerInternal";
import { deserializePathsRep } from "./MethodReplacements/BeltSystem.deserializePaths";
import { checkForModDifferencesRep } from "./MethodReplacements/MainMenuState.checkForModDifferences";
import { renderSavegamesRep } from "./MethodReplacements/MainMenuState.renderSavegames";
import { onEnterPost } from "./PrePostFixes/Post.MainMenuState.onEnter";
import { moveToStatePre } from "./PrePostFixes/Pre.GameState.moveToState";
import { initializeSettings } from "./settings";

import { fixCCT } from "./ModSpecificFixes/CCT";
import { registerModFix, runPossibleFixed } from "./ModSpecificFixes/handler";
import style from "./style.scss";
import { fixWrexcavator } from "./ModSpecificFixes/Wrexcavator";
//@ts-expect-error
import index from "C:/Users/Heather/OneDrive/Documents/Shapez.io/DengrNewEnv/WhoCares/index.pug";
import { ItemProcessorSystem } from "game/systems/item_processor";
import { startNewChargeRep } from "./MethodReplacements/ItemProcessorSystem.startNewCharge";

const logger = createLogger("forceload/core");
export const forceLoadExeptionLogger = createLogger("forceload/error");

export default class WhoCares extends Mod {
    public latestSavegame: SerializedGame;
    public forceLoad: boolean = false;
    public hasAllMods: boolean = false;
    public removedEntityUids: number[] = [];
    public WhoCaresSavegameData: Object = {
        savedEntities: {},
    };
    override init() {
        if (false) {
            this.settings = {};
            this.saveSettings();
        }
        //@ts-expect-error
        this.metadata.extra.readme = index;

        this.modInterface.registerTranslations("en", {
            dialogs: {
                buttons: { forceload: "ForceLoad", next: "Next" },
            },
        });

        this.modInterface.runBeforeMethod(GameState, "moveToState", moveToStatePre);
        this.modInterface.runAfterMethod(MainMenuState, "onEnter", onEnterPost); // Actually enable the dialog

        this.modInterface.extendClass(SavegameSerializer, SavegameSerializerExt);
        this.modInterface.extendClass(SerializerInternal, SerializerInternalExt);
        this.modInterface.replaceMethod(BeltSystem, "deserializePaths", deserializePathsRep);
        this.modInterface.replaceMethod(ItemProcessorSystem, "startNewCharge", startNewChargeRep);
        this.modInterface.replaceMethod(MainMenuState, "checkForModDifferences", checkForModDifferencesRep);
        this.modInterface.replaceMethod(MainMenuState, "renderSavegames", renderSavegamesRep);

        //Mod Fixes

        registerModFix("CCT", fixCCT, "preEntityPlaceDeserialize");
        registerModFix("Wrexcavator", fixWrexcavator, "MainMenuState");

        // End Mod Fixes
        this.signals.stateEntered.add((state) => {
            if (state instanceof MainMenuState) {
                if (!this.settings.seenSmSNotice) {
                    //@ts-expect-error
                    const { website } = this.dialogs.showInfo(
                        "Notice:",
                        `With the Authors permission, Who Cares now bundles a mod called "Save my Save" by StealthC within. If you would like to visit the webpage for Save my Save, click <a onclick="window.open('https://mod.io/g/shapez/m/save-my-save')">here</a>.`,
                        ["ok:good"]
                    );
                    this.settings.seenSmSNotice = true;
                    this.saveSettings();
                }
                if (this.forceLoad) {
                    const fixes = runPossibleFixed("MainMenuState");
                    const preEntityPlaceDeserialize = fixes[0],
                        ids = fixes[1];
                    for (let i = 0; i < ids.length; i++) {
                        eval(preEntityPlaceDeserialize[ids[i]] + `fix${ids[i]}()`);
                    }
                }
            }
        });
        initializeSettings(this);

        this.modInterface.replaceMethod(InGameState, "saveThenGoToState", ($orginal, [stateId, payload]) => {
            if (!stateId) return new SyntaxError();
            $orginal(stateId, payload);
        });

        this.modInterface.registerCss(style);
    }
}
