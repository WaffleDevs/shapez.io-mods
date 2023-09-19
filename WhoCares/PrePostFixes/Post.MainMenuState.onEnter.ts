/* This file contains Save My Save code.
   Any lines enclosed with the following are taken direct from SmS.
   
   // Save My Save

   // End Save My Save
    https://mod.io/g/shapez/m/save-my-save
*/

import { globalConfig } from "core/config";
import { ShapeDefinition } from "game/shape_definition";
import { forceLoadBypassLogger } from "..";

export function onEnterPost(payload) {
    if (!payload.loadError) return;
    this.dialogs.close();
    if (globalConfig["forceload"]) {
        const { ok } = this.dialogs.showWarning(
            "Failed",
            "WhoCares was unable to forceload your savegame. Please DM 'WaffleDevs' on discord and send them the save game for additional help.",
            [`ok:good${globalConfig["WhoCaresDevMode"] ? "" : ":timeout"}`]
        );
        ok.add(() => {
            globalConfig["forceload"] = false;
        });
        return;
    }
    if (globalConfig["hasAllMods"] || globalConfig["WhoCaresDevMode"]) {
        const { forceload } = this.dialogs.showWarning(
            "Force Load?",
            "Savegame failed to load. Forceloading may remove any errors and load anyway. This will destroy any data that is invalid. Create a backup before clicking continue.",
            ["cancel:good", `forceload:bad${globalConfig["WhoCaresDevMode"] ? "" : ":timeout"}`]
        );
        forceload.add(() => {
            // Save My Save
            const dump = globalConfig["latestSavegame"];
            if (dump.hubGoals != undefined) {
                for (const key of Object.keys(dump.hubGoals.storedShapes)) {
                    try {
                        ShapeDefinition.fromShortKey(key);
                    } catch (e) {
                        forceLoadBypassLogger.log(`Forceloader removing errored shape ${key}.`);
                        delete dump.hubGoals.storedShapes[key];
                    }
                }
            }
            // End Save My Save
            globalConfig["forceload"] = true;
            this.moveToState("InGameState", {
                savegame: dump,
            });
        });
    } else {
        const { next } = this.dialogs.showWarning(
            "Missing Mods",
            "WhoCares refuses to attempt to fix any savegames that are missing mods. Please install the mods that show on the next menu before continuing.",
            ["next:good"]
        );
        next.add(() => {
            this.dialogs.close();
            this.checkForModDifferences(globalConfig["latestSavegame"]);
        });
        return;
    }
}
