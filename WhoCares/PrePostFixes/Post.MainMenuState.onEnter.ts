/* This file contains Save My Save code.
   Any lines enclosed with the following are taken direct from SmS.
   
   // Save My Save

   // End Save My Save
    https://mod.io/g/shapez/m/save-my-save
*/

import { ShapeDefinition } from "game/shape_definition";
import WhoCares from "..";

export function onEnterPost(payload) {
    if (!payload.loadError) return;
    this.dialogs.close();
    if (WhoCares.prototype.forceLoad) {
        const { ok } = this.dialogs.showWarning(
            "Failed",
            "WhoCares was unable to forceload your savegame. Please DM 'WaffleDevs' on discord and send them the save game for additional help.",
            ["ok:good"]
        );
        ok.add(() => {
            WhoCares.prototype.forceLoad = false;
        });
        return;
    }
    const { forceload } = this.dialogs.showWarning(
        "Force Load?",
        "Savegame failed to load. Forceloading may remove any errors and load anyway. This will destroy any data that is invalid. Create a backup before clicking continue.",
        ["cancel:good", "forceload:bad"]
    );
    forceload.add(() => {
        // Save My Save
        const dump = WhoCares.prototype.latestSavegame;
        if (dump.hubGoals != undefined) {
            for (const key of Object.keys(dump.hubGoals.storedShapes)) {
                try {
                    ShapeDefinition.fromShortKey(key);
                } catch (e) {
                    delete dump.hubGoals.storedShapes[key];
                }
            }
        }
        // End Save My Save
        WhoCares.prototype.forceLoad = true;
        this.moveToState("InGameState", {
            savegame: WhoCares.prototype.latestSavegame,
        });
    });
}
