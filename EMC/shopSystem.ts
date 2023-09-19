import { globalConfig } from "core/config";
import { ItemEjectorComponent } from "game/components/item_ejector";
import { GameSystemWithFilter } from "game/game_system_with_filter";
import { ShapeItem } from "game/items/shape_item";
import { ShapeDefinition } from "game/shape_definition";
import { WireNetwork } from "game/systems/wire";
import { ShapeBuyerComponent } from "./buildings/shapeTablet";
import { emcForShape, hasEnoughEmc, hasEnoughEmcForShape, subtractASEmc } from "./emcManager";

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
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const ejectorComp: ItemEjectorComponent = entity.components.ItemEjector;

            const pinsComp = entity.components.WiredPins;
            if (!pinsComp) {
                continue;
            }
            const pin = pinsComp.slots[0];
            const network: WireNetwork = pin.linkedNetwork;

            if (!network || !network.hasValue() || network.currentValue._type != "shape") {
                continue;
            }
            //@ts-expect-error
            const shape = network.currentValue.definition.cachedHash;

            [0, 1, 2, 3].forEach((v) => {
                if (hasEnoughEmcForShape(shape)) {
                    ejectorComp.tryEject(v, new ShapeItem(ShapeDefinition.fromShortKey(shape)));
                    if (!hasEnoughEmc(emcForShape(shape) * globalConfig["infThreshold"])) subtractASEmc(shape);
                }
            });
        }
    }
}
