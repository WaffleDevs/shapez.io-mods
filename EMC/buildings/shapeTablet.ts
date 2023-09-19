import { globalConfig } from "core/config";
import { formatItemsPerSecond } from "core/utils";
import { arrayAllDirections, enumDirection, Vector } from "core/vector";
import { Component } from "game/component";
import { ItemAcceptorComponent } from "game/components/item_acceptor";
import { ItemEjectorComponent } from "game/components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "game/components/item_processor";
import { enumPinSlotType, WiredPinsComponent } from "game/components/wired_pins";
import { Entity } from "game/entity";
import { MOD_ITEM_PROCESSOR_SPEEDS } from "game/hub_goals";
import { defaultBuildingVariant } from "game/meta_building";
import { ShapeDefinition } from "game/shape_definition";
import { MOD_ITEM_PROCESSOR_HANDLERS } from "game/systems/item_processor";
import { Mod } from "mods/mod";
import { ModMetaBuilding } from "mods/mod_meta_building";
import { T } from "translations";
import { RESOURCES } from "..";
import { addAsEmc } from "../emcManager";

export function registerShapeTablet(mod: Mod) {
    //@ts-expect-error
    enumItemProcessorTypes.shapeSeller = "shapeSeller";
    //@ts-expect-error
    MOD_ITEM_PROCESSOR_SPEEDS.shapeSeller = () => globalConfig["root"].hubGoals.getBeltBaseSpeed();
    MOD_ITEM_PROCESSOR_HANDLERS.shapeSeller = shapeSellerHandler;

    mod.modInterface.registerNewBuilding({
        metaClass: MetaShapeTabletBuilding,
        buildingIconBase64: RESOURCES["shapeSellerIcon.png"],
    });

    // Add it to the regular toolbar
    mod.modInterface.addNewBuildingToToolbar({
        toolbar: "regular",
        location: "secondary",
        metaClass: MetaShapeTabletBuilding,
    });
}

function shapeSellerHandler(payload) {
    const shape = payload.items.get(0) || payload.items.get(1) || payload.items.get(2) || payload.items.get(3);
    const shapeDefinition: ShapeDefinition = shape.definition;
    addAsEmc(shapeDefinition.cachedHash);
}

class MetaShapeTabletBuilding extends ModMetaBuilding {
    constructor() {
        super("shapeTabletBuilding");
    }

    static getAllVariantCombinations() {
        return [
            {
                name: "Shape Seller",
                description: "Allows you to sell shapes for EMC.",
                variant: defaultBuildingVariant,

                regularImageBase64: RESOURCES["shapeSellerBuilding.png"],
                blueprintImageBase64: RESOURCES["shapeSellerBlueprint.png"],
            },
            {
                name: "Shape Buyer",
                description: "Allows you to buy shapes for EMC.",
                variant: "buyer",

                regularImageBase64: RESOURCES["shapeBuyerBuilding.png"],
                blueprintImageBase64: RESOURCES["shapeBuyerBlueprint.png"],
            },
        ];
    }

    getAvailableVariants() {
        return [defaultBuildingVariant, "buyer"];
    }
    getSilhouetteColor() {
        return "red";
    }

    getAdditionalStatistics(root): [string, string][] {
        //@ts-expect-error
        const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.shapeSeller);
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    getIsUnlocked(root) {
        return true;
    }

    setupEntityComponents(entity: Entity) {
        //     let slots = [];
        //     arrayAllDirections.forEach((element) => {
        //         slots.push({
        //             pos: new Vector(0, 0),
        //             direction: element,
        //             filter: "shape",
        //         });
        //     });
        //     entity.addComponent(
        //         new ItemAcceptorComponent({
        //             slots: slots,
        //         })
        //     );
        //     entity.addComponent(
        //         new ItemProcessorComponent({
        //             inputsPerCharge: 1,
        //             //@ts-expect-error
        //             processorType: enumItemProcessorTypes.shapeTablet,
        //         })
        //     );
        entity.addComponent(new ItemAcceptorComponent({ slots: [] }));
        entity.addComponent(new ItemEjectorComponent({ slots: [] }));
    }

    updateVariants(entity: Entity, rotationVariant: number, variant: string): void {
        if (variant == defaultBuildingVariant) {
            // Seller
            let slots = [];
            arrayAllDirections.forEach((element) => {
                slots.push({
                    pos: new Vector(0, 0),
                    direction: element,
                    filter: "shape",
                });
            });

            entity.components.ItemAcceptor.setSlots(slots);
            entity.components.ItemEjector.setSlots([]);

            if (entity.components.ShapeBuyerComponent) entity.removeComponent(ShapeBuyerComponent);
            if (!entity.components.ItemProcessor) {
                entity.addComponent(
                    new ItemProcessorComponent({
                        inputsPerCharge: 1,
                        //@ts-expect-error
                        processorType: enumItemProcessorTypes.shapeSeller,
                    })
                );
            }
            if (entity.components.WiredPins) entity.removeComponent(WiredPinsComponent);
        } else {
            let slots = [];
            arrayAllDirections.forEach((element) => {
                slots.push({
                    pos: new Vector(0, 0),
                    direction: element,
                });
            });
            entity.components.ItemEjector.setSlots(slots);
            entity.components.ItemAcceptor.setSlots([]);

            if (!entity.components.ShapeBuyerComponent) entity.addComponent(new ShapeBuyerComponent());
            if (entity.components.ItemProcessor) {
                entity.removeComponent(ItemProcessorComponent);
            }
            if (!entity.components.WiredPins) {
                entity.addComponent(
                    new WiredPinsComponent({
                        slots: [
                            {
                                pos: new Vector(0, 0),
                                type: enumPinSlotType.logicalAcceptor,
                                direction: enumDirection.bottom,
                            },
                        ],
                    })
                );
            }
        }
    }
}
export class ShapeBuyerComponent extends Component {
    static getId() {
        return "ShapeBuyer";
    }
}
