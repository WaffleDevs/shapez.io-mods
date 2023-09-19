/* This file contains Save My Save code.
   Any lines enclosed with the following have been taken from SmS with minor edits to work with Who Cares structure.
   
   // Save My Save
    Edited SmS Code...
   // End Save My Save
    https://mod.io/g/shapez/m/save-my-save
*/

import { globalConfig } from "core/config";
import { BeltPath } from "game/belt_path";
import { forceLoadBypassLogger } from "..";

export function deserializePathsRep($original, [data]) {
    console.log(globalConfig["forceload"] + " BELT DESER");
    if (globalConfig["forceload"]) {
        if (!Array.isArray(data)) {
            return "Belt paths are not an array: " + typeof data;
        }

        for (let i = 0; i < data.length; ++i) {
            // for (let i = 0; i < globalConfig["removedEntityUids"].length; ++i) {
            //     if (data[i].entityPath.includes(globalConfig["removedEntityUids"][i])) console.log(data[i]);
            // }
            for (let a = 0; a < data[i].entityPath.length; a++) {
                console.log(a, data[i].entityPath[a]);
                console.log(globalConfig["removedEntityUids"].includes(data[i].entityPath[a]), !globalConfig["root"].entityMgr.findByUid(data[i].entityPath[a], false));
                if (globalConfig["removedEntityUids"].includes(data[i].entityPath[a]) || !globalConfig["root"].entityMgr.findByUid(data[i].entityPath[a], false)) {
                    data[i].entityPath.splice(a, 1);
                    a--;
                }
            }
            if (data[i].entityPath.length == 0) {
                continue;
            }
            console.log(data[i]);
            const path = BeltPath.fromSerialized(this.root, data[i]);
            // If path is a string, that means its an error
            if (!(path instanceof BeltPath)) {
                return "Failed to create path from belt data: " + path;
            }
            this.beltPaths.push(path);
        }

        if (this.beltPaths.length === 0) {
            // Old savegames might not have paths yet
            forceLoadBypassLogger.warn("Recomputing belt paths (most likely the savegame is old or empty)");
            this.recomputeAllBeltPaths();
        } else {
            forceLoadBypassLogger.warn("Restored", this.beltPaths.length, "belt paths");
        }
    } else $original(data);
}
