import { GameSystem } from "game/game_system";
import { Mod } from "mods/mod";

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
