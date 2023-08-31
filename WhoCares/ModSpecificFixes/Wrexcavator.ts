import { globalConfig } from "core/config";
import { gItemRegistry } from "core/global_registries";
import { Loader } from "core/loader";

export function fixWrexcavator() {
    const wreckItem = gItemRegistry.getById("wreck");
    const index = gItemRegistry.entries.indexOf(wreckItem);

    // @ts-expect-error
    wreckItem.drawItemCenteredClipped = (x, y, parameters, diameter = globalConfig.defaultItemDiameter) => {
        const realDiameter = diameter * 0.6;
        if (!this.cachedSprite) {
            this.cachedSprite = Loader.getSprite(`sprites/wreck/shovel.png`);
        }
        this.cachedSprite.drawCachedCentered(parameters, x, y, realDiameter);
    };
    gItemRegistry.entries[index] = wreckItem;
}

/* 

If you are reading this, I dont think that this works :)

*/
