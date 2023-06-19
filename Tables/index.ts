import { Mod } from "mods/mod";
import { ModMetaBuilding } from "mods/mod_meta_building";
import { defaultBuildingVariant } from "game/meta_building";
import { Vector, enumDirection } from "core/vector";
import { WiredPinsComponent, enumPinSlotType } from "game/components/wired_pins";
import { TruthyBuildingComponent } from "./Components/TruthyComponent";
import { TruthySystem } from "./Systems/TruthySystem";
import { MetaTruthyBuilding } from "./Buildings/TruthyBuilding";
import { HUDTruthyTableEdit } from "./Hud/HudTruthyComponent";
import styles from "./style.scss";
import _ from "underscore";
import { MODS } from "mods/modloader";
import { gMetaBuildingRegistry } from "core/global_registries";
import { StaticMapEntityComponent } from "game/components/static_map_entity";
import { getBuildingDataFromCode, getCodeFromBuildingData } from "game/building_codes";
import { initSpriteCache } from "game/meta_building_registry";

/*
{
    "savedTables": [
        "111011|101_111001|101",
        "etc"
    ]
}

*/

// Todo: Finalize ./Components/TruthyComponent.ts truthyTable conversion to String.

export const checkerImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAARSURBVBhXYwCC////gzEDAwAp5AX7bk/yfwAAAABJRU5ErkJggg==";
export function truthyTableToId(table: string | Array<string>) {
    if (typeof table != "string") table = table.join("\n");
    return table.trim().replaceAll(" ", "").replaceAll("\n", "_");
}

export function validateTruthyTable(table: string | Array<string>) {
    const temp = validateTruthyTablea(table);
    console.log(temp);
    return temp;
}

export function validateTruthyTablea(table: string | Array<string>) {
    if (typeof table != "string") table = table.join("\n");

    if (table.trim().length == 0) return false;
    const entries = table.replaceAll("_", "\n").replaceAll(" ", "").trim().split("\n");
    const firstEntryLength = entries[0]!.trim().length;
    const firstEntryIO = entries[0]!.trim().split("|");
    if (firstEntryIO.length != 2) return false;
    if (firstEntryIO[0]!.length == 0 || firstEntryIO[1]!.length == 0) return false;
    const firstEntryIOLengths = [firstEntryIO[0]!.length, firstEntryIO[1]!.length];
    if (entries.length > 1) {
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            if (entry!.trim().length != firstEntryLength) return false;
            const currentEntryIO = entry!.trim().replaceAll(" ", "").split("|");
            if (currentEntryIO.length != 2) return false;
            const currentEntryIOLengths = [
                currentEntryIO[0]!.length,
                currentEntryIO[1]!.length,
            ];

            if (!_.isEqual(currentEntryIOLengths, firstEntryIOLengths)) return false;
        }
    }

    return table.replaceAll("_", "\n").search(/[^01|\s]+/gi) == -1;
}

export function getOrRegisterTableBuilding(table: string) {
    table = truthyTableToId(table);
    const metaBuilding = gMetaBuildingRegistry.findById(table);
    if (metaBuilding == null) registerBuildingFromTable(table);
    return gMetaBuildingRegistry.findById(table);
}

export function registerBuildingFromTable(table: string) {
    table = truthyTableToId(table).split("_")[0]!;

    const inputs = table!.split("|")[0]?.split("");
    const outputs = table!.split("|")[1]?.split("");

    let slots: { pos: Vector; direction: string; type: string }[] = [];

    for (let i = 0; i < inputs!.length; i++) {
        slots.push({
            pos: new Vector(i, 0),
            direction: enumDirection.bottom,
            type: enumPinSlotType.logicalAcceptor,
        });
    }
    for (let i = 0; i < outputs!.length; i++) {
        slots.push({
            pos: new Vector(i, 0),
            direction: enumDirection.top,
            type: enumPinSlotType.logicalEjector,
        });
    }
    const size = inputs!.length > outputs!.length ? inputs!.length : outputs!.length;
    console.log(
        `${size} |||||||||||||||||||||||||||||||||||||||||||||||||\n${truthyTableToId(
            table
        )}`
    );
    const TempTruthyBuilding = class extends ModMetaBuilding {
        constructor() {
            super(truthyTableToId(table));
        }
        static override getAllVariantCombinations() {
            return [
                {
                    variant: defaultBuildingVariant,
                    name: table,
                    description: table,

                    regularImageBase64: checkerImage,
                    blueprintImageBase64: checkerImage,
                    tutorialImageBase64: checkerImage,
                },
            ];
        }
        override getSilhouetteColor() {
            return "red";
        }
        override getLayer() {
            return "wires";
        }

        override getDimensions() {
            return new Vector(size, 1);
        }
        override setupEntityComponents(entity: any): void {
            entity.addComponent(
                new WiredPinsComponent({
                    slots: slots,
                })
            );
        }
    };

    MODS.modInterface.registerNewBuilding({
        metaClass: TempTruthyBuilding,
        buildingIconBase64: checkerImage,
    });

    // Add it to the regular toolbar
    MODS.modInterface.addNewBuildingToToolbar({
        toolbar: "regular",
        location: "primary",
        metaClass: TempTruthyBuilding,
    });
    initSpriteCache();
}

export default class extends Mod {
    override init() {
        this.modInterface.registerComponent(TruthyBuildingComponent);

        // Register the new building
        this.modInterface.registerNewBuilding({
            metaClass: MetaTruthyBuilding,
            buildingIconBase64: checkerImage,
        });

        // Add it to the regular toolbar
        this.modInterface.addNewBuildingToToolbar({
            toolbar: "wires",
            location: "secondary",
            metaClass: MetaTruthyBuilding,
        });

        // Register our game system so we can dispatch the truthys
        this.modInterface.registerGameSystem({
            id: "truthyBlockSystem",
            systemClass: TruthySystem,
            before: "constantSignal",
        });

        // Register our hud element to be able to edit the truthy texts
        this.modInterface.registerHudElement("truthyBlockEdit", HUDTruthyTableEdit);

        this.modInterface.registerCss(styles);
    }

    initializeTruthyBuildings() {
        for (const table in this.settings.savedTruthyTables) {
            registerBuildingFromTable(table);
        }
    }
}
