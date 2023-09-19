import { globalConfig } from "core/config";
import { GameRoot } from "core/draw_parameters";
import { ExplainedResult } from "core/explained_result";
import { gComponentRegistry } from "core/global_registries";
import { Camera } from "game/camera";
import { Entity } from "game/entity";
import { GameTime } from "game/time/game_time";
import { MOD_SIGNALS } from "mods/mod_signals";
import { SerializedGame } from "savegame/savegame_typedefs";
import { forceLoadBypassLogger } from "..";

export const SavegameSerializerExt = ({ $super, $old }) => ({
    /**
     * Serializes the game root into a dump
     * @param {GameRoot} root
     * @param {boolean=} sanityChecks Whether to check for validity
     * @returns {object}
     */
    generateDumpFromGameRoot(root: GameRoot, sanityChecks: boolean | undefined = true): object {
        /** @type {SerializedGame} */
        const data: SerializedGame = {
            camera: root.camera.serialize(),
            time: root.time.serialize(),
            map: root.map.serialize(),
            gameMode: root.gameMode.serialize(),
            entityMgr: root.entityMgr.serialize(),
            hubGoals: root.hubGoals.serialize(),
            entities: this.internal.serializeEntityArray(root.entityMgr.entities),
            beltPaths: root.systemMgr.systems.belt.serializePaths(),
            pinnedShapes: root.hud.parts.pinnedShapes ? root.hud.parts.pinnedShapes.serialize() : null,
            waypoints: root.hud.parts.waypoints ? root.hud.parts.waypoints.serialize() : null,

            modExtraData: {},
        };

        MOD_SIGNALS.gameSerialized.dispatch(root, data);
        return data;
    },

    /**
     * Verifies if there are logical errors in the savegame
     * @param {SerializedGame} savegame
     * @returns {ExplainedResult}
     */
    verifyLogicalErrors(root: GameRoot, savegame: SerializedGame): ExplainedResult {
        if (!savegame.entities) {
            return ExplainedResult.bad("Savegame has no entities");
        }
        const forceLoad = globalConfig["forceload"];

        const seenUids = new Set();

        // Check for duplicate UIDS
        for (let i = 0; i < savegame.entities.length; ++i) {
            const entity: Entity = savegame.entities[i];

            const uid = entity.uid;
            if (!Number.isInteger(uid)) {
                return ExplainedResult.bad("Entity has invalid uid: " + uid);
            }
            if (seenUids.has(uid)) {
                if (forceLoad) {
                    forceLoadBypassLogger.log(`Forceloading past "Duplicate uid ${uid}"`);
                    root.savegame.getCurrentDump().entities.splice(root.savegame.getCurrentDump().entities.indexOf(entity));
                } else return ExplainedResult.bad("Duplicate uid " + uid);
            }
            seenUids.add(uid);

            // Verify components
            if (!entity.components) {
                return ExplainedResult.bad("Entity is missing key 'components': " + JSON.stringify(entity));
            }

            const components = entity.components;
            for (const componentId in components) {
                const componentClass = gComponentRegistry.findById(componentId);

                // Check component id is known
                if (!componentClass) {
                    if (forceLoad) {
                        forceLoadBypassLogger.log(`Forceloading past "Unknown component id: ${componentId}"`);
                        continue;
                    }
                    return ExplainedResult.bad("Unknown component id: " + componentId);
                }

                // Verify component data
                const componentData = components[componentId];
                const componentVerifyError = /** @type {StaticComponent} */ componentClass.verify(componentData);

                // Check component data is ok
                if (componentVerifyError) {
                    return ExplainedResult.bad("Component " + componentId + " has invalid data: " + componentVerifyError);
                }
            }
        }

        return ExplainedResult.good();
    },

    /**
     * Tries to load the savegame from a given dump
     * @param {SerializedGame} savegame
     * @param {GameRoot} root
     * @returns {ExplainedResult}
     */
    deserialize(savegame: SerializedGame, root: GameRoot): ExplainedResult {
        globalConfig["removedEntityUids"] = [];
        const verifyResult = this.verifyLogicalErrors(root, savegame);
        if (!verifyResult.result) {
            return ExplainedResult.bad(verifyResult.reason);
        }
        let errorReason = null;

        errorReason = errorReason || root.entityMgr.deserialize(savegame.entityMgr); // Havent had issues

        try {
            if (typeof root.time.deserialize(savegame.time) == "string" && globalConfig["forceload"]) {
                const { timeSeconds, realtimeSeconds, speed } = new GameTime(root);
                savegame.time.timeSeconds = timeSeconds;
                savegame.time.realtimeSeconds = realtimeSeconds;
                savegame.time.speed = { $: speed.getId(), data: {} };
            }
        } catch (error) {}

        errorReason = errorReason || root.time.deserialize(savegame.time); // What

        try {
            if (typeof root.camera.deserialize(savegame.camera) == "string" && globalConfig["forceload"]) savegame.camera.prototype = new Camera(root);
        } catch (error) {}

        errorReason = errorReason || root.camera.deserialize(savegame.camera); // Unimportant to bypass. Doing it anyway 👍
        errorReason = errorReason || root.map.deserialize(savegame.map); // Unimportant to bypass.
        errorReason = errorReason || root.gameMode.deserialize(savegame.gameMode); // Not going to fix until someone actually breaks this 👍
        errorReason = errorReason || root.hubGoals.deserialize(savegame.hubGoals, root); // Fixed via WhoCares root/PrePostFixes/Post.MainMenuState.onEnter.ts
        errorReason = errorReason || this.internal.deserializeEntityArray(root, savegame.entities); // Fixed via WhoCares root/ClassExtensions/SerializerInternal.ts
        errorReason = errorReason || root.systemMgr.systems.belt.deserializePaths(savegame.beltPaths); // Fixed via WhoCares root/MethodReplacements/BeltSystem.deserializePaths.ts

        if (root.hud.parts.pinnedShapes) {
            errorReason = errorReason || root.hud.parts.pinnedShapes.deserialize(savegame.pinnedShapes);
        }

        if (root.hud.parts.waypoints) {
            errorReason = errorReason || root.hud.parts.waypoints.deserialize(savegame.waypoints);
        }

        // Check for errors
        if (errorReason) {
            return ExplainedResult.bad(errorReason);
        }

        // Mods
        MOD_SIGNALS.gameDeserialized.dispatch(root, savegame);

        return ExplainedResult.good();
    },
});
