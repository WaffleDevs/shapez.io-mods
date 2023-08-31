import { clamp, formatItemsPerSecond } from "core/utils";
import { Vector, enumDirection } from "core/vector";
import { Component } from "game/component";
import { ItemAcceptorComponent } from "game/components/item_acceptor";
import { ItemEjectorComponent } from "game/components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "game/components/item_processor";
import { GameSystem } from "game/game_system";
import { GameSystemWithFilter } from "game/game_system_with_filter";
import { MOD_ITEM_PROCESSOR_SPEEDS } from "game/hub_goals";
import { defaultBuildingVariant } from "game/meta_building";
import { TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT, TOP_LEFT, ShapeDefinition } from "game/shape_definition";
import { MOD_ITEM_PROCESSOR_HANDLERS } from "game/systems/item_processor";
import { Mod } from "mods/mod";
import { ModMetaBuilding } from "mods/mod_meta_building";
import { types } from "savegame/serialization";
import { T } from "translations";

class UidSystem extends GameSystem {
    constructor(root) {
        super(root);
    }

    update() {}

    drawChunk(parameters, chunk) {
        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const staticComp = entity.components.StaticMapEntity;
            const context = parameters.context;
            const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();

            // Culling for better performance
            if (parameters.visibleRect.containsCircle(center.x, center.y, 40)) {
                // Background badge
                context.fillStyle = "rgba(250, 250, 250, 0.8)";
                context.beginRoundedRect(center.x - 10, center.y + 3, 20, 8, 2);

                context.fill();

                context.textAlign = "center";
                context.fillStyle = "red";
                context.font = "7px GameFont";
                context.fillText(entity.uid, center.x, center.y + 10);
            }
        }
    }
}

export default class extends Mod {
    override init() {
        this.modInterface.registerGameSystem({
            id: "demo_mod",
            systemClass: UidSystem,
            before: "belt",
            drawHooks: ["staticAfter"],
        });
    }
}
