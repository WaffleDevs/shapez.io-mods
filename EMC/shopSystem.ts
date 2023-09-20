import { globalConfig } from "core/config";
import { ItemEjectorComponent } from "game/components/item_ejector";
import { GameSystemWithFilter } from "game/game_system_with_filter";
import { ShapeItem } from "game/items/shape_item";
import { ShapeDefinition } from "game/shape_definition";
import { WireNetwork } from "game/systems/wire";
import { ShapeBuyerComponent } from "./buildings/shapeTablet";
import { emcForShape, emcShape, hasEnoughEmc, hasEnoughEmcForShape, subtractASEmc } from "./emcManager";

let timeSinceLastOut = 0;

export class ShapeBuyerSystem extends GameSystemWithFilter {
    item;
    allEntities;
    constructor(root) {
        super(root, [ShapeBuyerComponent]);
        this.item = null;

        this.root.signals.entityManuallyPlaced.add((entity) => {
            //@ts-expect-error
            const editorHud = this.root.hud.parts.shapeBuyerEdit;
            if (editorHud) {
                editorHud.editShapeBuyerText(entity, { deleteOnCancel: true });
            }
        });
    }

    update() {
        this.root.hubGoals.storedShapes[emcShape] = Math.round(this.root.hubGoals.storedShapes[emcShape]);

        const outputsPerSecond = this.root.hubGoals.getBeltBaseSpeed() / 4;
        if (Date.now() <= timeSinceLastOut + 1000 / outputsPerSecond) return;
        timeSinceLastOut = Date.now();

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const ejectorComp: ItemEjectorComponent = entity.components.ItemEjector;

            const shopComp = entity.components.ShapeBuyer;
            const pinsComp = entity.components.WiredPins;

            const pin = pinsComp.slots[0];
            const network: WireNetwork = pin.linkedNetwork;
            let shape = shopComp.shape;

            if (network?.hasValue() && network.currentValue._type == "shape") {
                // @ts-expect-error
                shape = network.currentValue.definition.cachedHash;
            }

            if (!ShapeDefinition.isValidShortKey(shape) || !hasEnoughEmcForShape(this.root, shape)) {
                continue;
            }
            if (typeof shape != "string") {
                shape = "CuCucuCu";
            }
            const shapeDef = ShapeDefinition.fromShortKey(shape);
            const shapeItem = new ShapeItem(shapeDef);

            [0, 1, 2, 3].forEach((v) => {
                if (hasEnoughEmcForShape(this.root, shape)) {
                    this.root.productionAnalytics.onItemProduced(shapeItem);
                    const didEject = ejectorComp.tryEject(v, shapeItem);
                    if (didEject && !hasEnoughEmc(this.root, emcForShape(shape, false) * globalConfig["infThreshold"])) subtractASEmc(this.root, shape);
                }
            });
        }
    }
}
