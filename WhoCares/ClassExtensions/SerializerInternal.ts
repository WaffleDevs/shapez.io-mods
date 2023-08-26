import { Vector } from "core/vector";
import { getBuildingDataFromCode, getCodeFromBuildingData } from "game/building_codes";
import { Entity } from "game/entity";
import { GameRoot } from "game/root";
import { type SerializedGame } from "savegame/savegame";
import WhoCares from "..";
import { createLogger } from "core/logging";
import { getSettings, setSettings } from "../settings";
import { StaticMapEntityComponent } from "game/components/static_map_entity";
const logger = createLogger("forceload/serint");

export const SerializerInternalExt = ({ $super, $old }) => ({
    serializeEntityArray(array: any) {
        const serialized = [];
        for (let i = 0; i < array.length; ++i) {
            const entity = array[i];
            if (!entity!.queuedForDestroy && !entity!.destroyed) {
                serialized.push(entity!.serialize());
            }
        }
        return serialized;
    },

    deserializeEntityArray(root: GameRoot, array: Entity[], savegame: SerializedGame) {
        let result;
        for (let i = 0; i < array.length; ++i) {
            result = result || this.deserializeEntity(root, array[i], savegame);
        }
        if (result) return result;
    },

    deserializeEntity(root: GameRoot, payload: Entity, savegame: SerializedGame) {
        const forceLoad = WhoCares.prototype.forceLoad;

        const staticData = payload.components.StaticMapEntity;
        assert(staticData, "entity has no static data");
        let code = staticData.code;
        let data = getBuildingDataFromCode(code);
        if (data == undefined) {
            if (!forceLoad) return "Unregistered Building";
            else {
                root.savegame.getCurrentDump().entities.splice(root.savegame.getCurrentDump().entities.indexOf(payload));

                const buildingData = getSettings("savedEntities", payload.uid);
                if (!buildingData) return;
                code = `Missing${buildingData.tileSize.x}x${buildingData.tileSize.y}Building`;
                data = getBuildingDataFromCode(code);
                data.rotationVariant = buildingData.rotationVariant;
                data.variant = buildingData.variant;
            }
        }
        if (!forceLoad)
            setSettings(
                "savedEntities",
                0,
                {
                    tileSize: data.tileSize,
                    rotationVariant: data.rotationVariant,
                    variant: data.variant,
                },
                payload.uid
            );

        const metaBuilding = data.metaInstance;
        metaBuilding.createEntity = function ({ root, origin, rotation, originalRotation, rotationVariant, variant }) {
            const entity = new Entity(root);
            entity.layer = this.getLayer();
            entity.addComponent(
                new StaticMapEntityComponent({
                    origin: new Vector(origin.x, origin.y),
                    rotation,
                    originalRotation,
                    tileSize: this.getDimensions(variant).copy(),
                    code: code,
                })
            );
            entity.components.StaticMapEntity.code = code;
            this.setupEntityComponents(entity, root);
            this.updateVariants(entity, rotationVariant, variant);

            return entity;
        };

        const entity = metaBuilding.createEntity({
            root,
            origin: Vector.fromSerializedObject(staticData.origin),
            rotation: staticData.rotation,
            originalRotation: staticData.originalRotation,
            rotationVariant: data.rotationVariant,
            variant: data.variant,
        });

        entity.uid = payload.uid;

        this.deserializeComponents(root, entity, payload.components);
        entity.components.StaticMapEntity.code = code;
        entity.uid = payload.uid;
        console.log(entity.uid);
        root.entityMgr.registerEntity(entity, payload.uid);
        root.map.placeStaticEntity(entity);
    },

    deserializeComponents(root: GameRoot, entity: Entity, data: any): string | void {
        for (const componentId in data) {
            if (!entity.components[componentId]) {
                continue;
            }

            const errorStatus = entity.components[componentId].deserialize(data[componentId], root);
            if (errorStatus) {
                return errorStatus;
            }
        }
    },
});
