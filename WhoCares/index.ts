/*
    This mod has code taken from Save my Save. Not all of Save my Save's code and savegame fixes have been implemented, as there are more powerful ones already implemented.
    https://mod.io/g/shapez/m/save-my-save
*/

//@ts-expect-error
import index from "./index.pug";
//@ts-expect-error
import warning from "./warning.png";

import { GameState } from "core/game_state";
import { createLogger } from "core/logging";
import { BeltSystem } from "game/systems/belt";
import { Mod } from "mods/mod";
import { SavegameSerializer } from "savegame/savegame_serializer";
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

import { globalConfig } from "core/config";
import { ItemProcessorSystem } from "game/systems/item_processor";
import { startNewChargeRep } from "./MethodReplacements/ItemProcessorSystem.startNewCharge";
import style from "./style.scss";

import { MapChunkView } from "game/map_chunk_view";
import { LogicGateSystem } from "game/systems/logic_gate";
import { HUDErrorViewer } from "./ErrorViewer/errorHud";
import { ErrorSymbolComponent, ErrorSymbolSystem } from "./ErrorViewer/errorSymbol";
import { initializeErrorViewer } from "./ErrorViewer/errorViewer";
import { updateRep } from "./MethodReplacements/LogicGateSystem.update";
import { fixWrexcavator } from "./ModSpecificFixes/Wrexcavator";

const logger = createLogger("forceload/core");
export const forceLoadExeptionLogger = createLogger("forceload/error");
export const forceLoadBypassLogger = createLogger("forceload/bypass");
export default class WhoCares extends Mod {
    override init() {
        if (false) {
            this.settings = {};
            this.saveSettings();
        }
        globalConfig["WhoCaresDevMode"] = true; //getMod("DevTools") ? true : false;

        globalConfig["forceload"] = false;
        globalConfig["latestSavegame"] = undefined;
        globalConfig["hasAllMods"] = false;
        globalConfig["removedEntityUids"] = [];

        //@ts-expect-error
        this.metadata.extra.readme = index;

        this.modInterface.registerTranslations("en", {
            dialogs: {
                buttons: { forceload: "ForceLoad", next: "Next" },
            },
        });

        this.modInterface.runBeforeMethod(GameState, "moveToState", moveToStatePre);
        this.modInterface.runAfterMethod(MainMenuState, "onEnter", onEnterPost); // Actually enable the dialog
        this.modInterface.replaceMethod(BeltSystem, "deserializePaths", deserializePathsRep);
        this.modInterface.replaceMethod(ItemProcessorSystem, "startNewCharge", startNewChargeRep);
        this.modInterface.replaceMethod(MainMenuState, "checkForModDifferences", checkForModDifferencesRep);
        this.modInterface.replaceMethod(MainMenuState, "renderSavegames", renderSavegamesRep);
        this.modInterface.replaceMethod(LogicGateSystem, "update", updateRep);
        this.modInterface.extendClass(SavegameSerializer, SavegameSerializerExt);
        this.modInterface.extendClass(SerializerInternal, SerializerInternalExt);

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
                if (globalConfig["forceload"]) {
                    eval(fixWrexcavator + `fixWrexcavator()`);
                }
            }
        });

        this.modInterface.replaceMethod(InGameState, "saveThenGoToState", ($orginal, [stateId, payload]) => {
            if (!stateId) return new SyntaxError();
            $orginal(stateId, payload);
        });

        this.modInterface.registerComponent(ErrorSymbolComponent);

        this.modInterface.runAfterMethod(MapChunkView, "drawWiresForegroundLayer", function (parameters) {
            const systems = this.root.systemMgr.systems;
            parameters.runningAfterWires = true;
            systems["whocares_error_symbol"].drawChunk(parameters, this);
        });

        this.modInterface.registerGameSystem({
            id: "whocares_error_symbol",
            systemClass: ErrorSymbolSystem,
            before: "end",
            drawHooks: ["staticAfter"],
        });

        this.modInterface.registerSprite("sprites/whocares/warning.png", warning);
        this.modInterface.registerCss(style);
        this.signals.gameInitialized.add(this.registerHud, this);
        initializeSettings(this);
        initializeErrorViewer(this);
    }
    registerHud(root) {
        globalConfig["root"] = root;
        // @ts-ignore
        const part = new HUDErrorViewer(root, this);
        root.hud.parts.errorViewer = part;

        //part.createElements(document.body);
        part.createElements(document.body);
        this.signals.hudElementInitialized.dispatch(part);
        part.initialize();
        this.signals.hudElementFinalized.dispatch(part);
    }
}
