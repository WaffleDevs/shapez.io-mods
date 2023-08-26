/* This file contains Save My Save code.
   Any lines enclosed with the following have been taken from SmS with minor edits to work with Who Cares structure.
   
   // Save My Save

   // End Save My Save
    https://mod.io/g/shapez/m/save-my-save
*/

import { itemResolverSingleton } from "game/item_resolver";
import WhoCares from "..";

export function deserializePathsRep($original, [data]) {
    if (WhoCares.prototype.forceLoad) {
        let anyerror = false;
        if (Array.isArray(data)) {
            for (let i = 0; i < data.length; ++i) {
                if (data[i].items) {
                    for (let x = data[i].items.length - 1; x >= 0; x--) {
                        const item = data[i].items[x][1];
                        try {
                            itemResolverSingleton(this.root, item);
                        } catch (e) {
                            data[i].items.splice(x, 1);
                            anyerror = true;
                        }
                    }
                }
            }
            if (anyerror) {
                this.recomputeAllBeltPaths();
            }
        }
        return $original(data);
    }
    return $original(data);
}
