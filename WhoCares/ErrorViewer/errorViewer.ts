import { globalConfig } from "core/config";
import { Entity } from "game/entity";
import { Mod } from "mods/mod";
import { forceLoadBypassLogger } from "..";
import { ErrorSymbolComponent } from "./errorSymbol";
let mod: Mod;

globalConfig.foundErrors = {};

export function initializeErrorViewer(WhoCares: Mod) {
    mod = WhoCares;
    mod.signals.stateEntered.add((state) => {
        globalConfig.foundErrors = {};
    });
}

export function registerError(error: Error, entity: Entity, context: String) {
    if (globalConfig.foundErrors[entity.uid]) return;
    globalConfig.foundErrors[entity.uid] = {
        error,
        entity,
    };
    entity.addComponent(new ErrorSymbolComponent());

    forceLoadBypassLogger.log(`${context}: Bypassing ${error.message}`);
    setTimeout(() => {
        delete globalConfig.foundErrors[entity.uid];
    }, 500);
}
