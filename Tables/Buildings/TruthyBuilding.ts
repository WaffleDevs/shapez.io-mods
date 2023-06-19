import { Vector, enumDirection } from "core/vector";
import { WiredPinsComponent, enumPinSlotType } from "game/components/wired_pins";
import { defaultBuildingVariant } from "game/meta_building";
import { ModMetaBuilding } from "mods/mod_meta_building";
import { checkerImage } from "..";
import { TruthyBuildingComponent } from "../Components/TruthyComponent";

export class MetaTruthyBuilding extends ModMetaBuilding {
    constructor() {
        super("truthy_block");
    }

    static override getAllVariantCombinations() {
        return [
            {
                variant: defaultBuildingVariant,
                name: "Truthy Block",
                description: "TODO",

                regularImageBase64: checkerImage,
                blueprintImageBase64: checkerImage,
                tutorialImageBase64: checkerImage,
            },
        ];
    }

    override getSilhouetteColor() {
        return "#daff89";
    }

    override getIsUnlocked() {
        return true;
    }

    override getLayer() {
        return "wires";
    }

    override getDimensions() {
        return new Vector(1, 1);
    }

    override getRenderPins() {
        // Do not show pin overlays since it would hide our building icon
        return false;
    }

    override setupEntityComponents(entity: { addComponent: (arg0: any) => void }) {
        // Accept logical input from the bottom
        entity.addComponent(
            new WiredPinsComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.bottom,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                ],
            })
        );

        // Add your truthy component to identify the building as a truthy block
        entity.addComponent(new TruthyBuildingComponent());
    }
}
