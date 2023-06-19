import { Mod } from "mods/mod";
import { ModMetaBuilding } from "mods/mod_meta_building";
import { defaultBuildingVariant } from "game/meta_building";
import { Vector } from "core/vector";
import { SerializerInternal } from "savegame/serializer_internal";
import { getBuildingDataFromCode } from "game/building_codes";
import type { GameRoot } from "game/root";

const checkerImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAARSURBVBhXYwCC////gzEDAwAp5AX7bk/yfwAAAABJRU5ErkJggg==";

export default class extends Mod {
    override init() {
        let gameHeight = 0;
        this.modInterface.registerNewBuilding({
            metaClass: MissingBuildingBuilding,
            buildingIconBase64: checkerImage,
        });

        this.modInterface.replaceMethod(
            SerializerInternal,
            "deserializeEntity",
            function ($original, [root, payload]) {
                const staticData = payload.components.StaticMapEntity;
                // switch (staticData.rotation) {
                //     case 0:
                //     case 90:
                //     case 180:
                //         staticData.rotation += 90;
                //         break;
                //     case 270:
                //         staticData.rotation = 0;
                // }

                // staticData.origin.x = -staticData.origin.x;
                // staticData.origin.y = -staticData.origin.y;
                // staticData.rotation += 180;
                // if (staticData.rotation >= 360) staticData.rotation -= 360;

                const code = staticData.code;
                let data = getBuildingDataFromCode(code);

                const metaBuilding = data.metaInstance;

                const entity = metaBuilding!.createEntity({
                    root,
                    origin: Vector.fromSerializedObject(staticData.origin),
                    rotation: staticData.rotation,
                    originalRotation: staticData.originalRotation,
                    rotationVariant: data.rotationVariant!,
                    variant: data.variant!,
                });

                entity.uid = payload.uid;

                this.deserializeComponents(root, entity, payload.components);

                root.entityMgr.registerEntity(entity, payload.uid);
                root.map.placeStaticEntity(entity);
            }
        );
        this.signals.gameStarted.add((root: GameRoot) => {
            const canvas = document.getElementById("ingame_Canvas");
            setInterval(() => {
                canvas!.style.height = `${parseInt(canvas!.style.height) / 2}px`;
            }, 1000);
        });
    }
}
class MissingBuildingBuilding extends ModMetaBuilding {
    constructor() {
        super("MissingBuildingBuilding");
    }
    static override getAllVariantCombinations() {
        return [
            {
                variant: defaultBuildingVariant,
                name: "Truthy Table",
                description: "Create a custom building with the given truthy table.",

                regularImageBase64: checkerImage,
                blueprintImageBase64: checkerImage,
                tutorialImageBase64: checkerImage,
            },
        ];
    }
    override getSilhouetteColor() {
        return "red";
    }
    override setupEntityComponents(entity: any): void {}
}
