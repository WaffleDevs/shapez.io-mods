/* This file contains Save My Save code.
   Any lines enclosed with the following have been taken from SmS with minor edits to work with Who Cares structure.
   
   // Save My Save
    Edited SmS Code...
   // End Save My Save
    https://mod.io/g/shapez/m/save-my-save
*/

import { itemResolverSingleton } from "game/item_resolver";
import WhoCares from "..";
import { createLogger } from "core/logging";
import { BeltPath } from "game/belt_path";
/**if (data[i].items) {
                for (let x = data[i].items.length - 1; x >= 0; x--) {
                    const item = data[i].items[x][1];
                    try {
                        itemResolverSingleton(this.root, item);
                    } catch (e) {
                        logger.log("Forceloader removing belt item.");
                        data[i].items.splice(x, 1);
                        anyError = true;
                    }
                }
            } */
const logger = createLogger("forceload/desSerPath");

export function deserializePathsRep($original, [data]) {
    console.log(WhoCares.prototype.forceLoad + " BELT DESER");
    if (WhoCares.prototype.forceLoad) {
        if (!Array.isArray(data)) {
            return "Belt paths are not an array: " + typeof data;
        }

        for (let i = 0; i < data.length; ++i) {
            for (let i = 0; i < WhoCares.prototype.removedEntityUids.length; ++i) {
                console.log(WhoCares.prototype.removedEntityUids[i]);
                console.log(data[i].entityPath);
                if (data[i].entityPath.includes(WhoCares.prototype.removedEntityUids[i])) console.log(data[i]);
            }
            const path = BeltPath.fromSerialized(this.root, data[i]);
            // If path is a string, that means its an error
            if (!(path instanceof BeltPath)) {
                return "Failed to create path from belt data: " + path;
            }
            this.beltPaths.push(path);
        }

        if (this.beltPaths.length === 0) {
            // Old savegames might not have paths yet
            logger.warn("Recomputing belt paths (most likely the savegame is old or empty)");
            this.recomputeAllBeltPaths();
        } else {
            logger.warn("Restored", this.beltPaths.length, "belt paths");
        }
    } else $original(data);
}
