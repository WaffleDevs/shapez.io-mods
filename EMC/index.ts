import { globalConfig } from "core/config";
import { Mod } from "mods/mod";
import { registerShapeTablet } from "./buildings/shapeTablet";
import { initEmcViewer } from "./emcManager";
import { initializeSavegameFunctions } from "./savegame";
import { ShapeBuyerSystem } from "./shopSystem";

//@ts-expect-error
import index from "./index.pug";
//@ts-expect-error
import shapeBuyer from "./shapeBuyer.png";
//@ts-expect-error
import shapeSeller from "./shapeSeller.png";
//@ts-expect-error
import shapeBuyerBlueprint from "./shapeBuyerBlueprint.png";
//@ts-expect-error
import shapeSellerBlueprint from "./shapeSellerBlueprint.png";
//@ts-expect-error
import shapeSellerIcon from "./shapeTabletIcon.png";

export const RESOURCES = {
    "shapeBuyerBuilding.png": shapeBuyer,
    "shapeSellerBuilding.png": shapeSeller,

    "shapeBuyerBlueprint.png": shapeBuyerBlueprint,
    "shapeSellerBlueprint.png": shapeSellerBlueprint,

    "shapeSellerIcon.png": shapeSellerIcon,
    "shapeBuyerIcon.png": shapeSellerIcon,
};

export default class extends Mod {
    override init() {
        globalConfig["emcWeights"] = {
            shapes: this.settings.quadShapeMulti,
            colors: this.settings.quadColorMulti,
            layers: this.settings.layerMulti,
        };
        globalConfig["infThreshold"] = this.settings.infiniteShapeThreshold;

        //@ts-expect-error
        this.metadata.extra.readme = index;

        registerShapeTablet(this);
        initializeSavegameFunctions(this);
        initEmcViewer(this);

        this.modInterface.registerGameSystem({
            id: "shapeBuyer",
            systemClass: ShapeBuyerSystem,
            before: "constantSignal",
        });

        this.modLoader.signals.gameStarted.add((root) => {
            globalConfig["root"] = root;
        });
    }
}
