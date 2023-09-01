import { globalConfig } from "core/config";
import { createLogger } from "core/logging";
import { Vector } from "core/vector";
import { getBuildingDataFromCode } from "game/building_codes";
import { Entity } from "game/entity";
import { GameRoot } from "game/root";
import { runPossibleFixed } from "../ModSpecificFixes/handler";
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

    deserializeEntityArray(root: GameRoot, array: Entity[]) {
        for (let i = 0; i < array.length; ++i) {
            this.deserializeEntity(root, array[i]);
        }
    },

    deserializeEntity(root: GameRoot, payload: Entity) {
        const staticData = payload.components.StaticMapEntity;
        assert(staticData, "entity has no static data");
        let code = staticData.code;
        let data = getBuildingDataFromCode(code);
        console.log(`log ${payload.uid}`);
        if (data == undefined) {
            if (globalConfig["forceload"]) {
                return;
                // console.log(`Debug - file: SerializerInternal.ts:37 - deserializeEntity - hoCares.prototype.forceLoa:`, globalConfig["forceload"]);
                // globalConfig["removedEntityUids"].push(payload.uid);
                // root.savegame.getCurrentDump().entities.splice(root.savegame.getCurrentDump().entities.indexOf(payload));
                // return;
            } else throw new Error(); //return "Unregistered Building";
        }

        const metaBuilding = data.metaInstance;

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
        if (globalConfig["forceload"]) {
            const fixes = runPossibleFixed("preEntityPlaceDeserialize");
            const preEntityPlaceDeserialize = fixes[0],
                ids = fixes[1];
            for (let i = 0; i < ids.length; i++) {
                eval(preEntityPlaceDeserialize[ids[i]] + `fix${ids[i]}()`);
            }
        }
        root.entityMgr.registerEntity(entity, payload.uid);
        console.log(entity);
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
