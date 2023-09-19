import { globalConfig } from "core/config";
import { Loader } from "core/loader";
import { Component } from "game/component";
import { Entity } from "game/entity";
import { GameSystemWithFilter } from "game/game_system_with_filter";
import { MapChunk } from "game/map_chunk";

export class ErrorSymbolComponent extends Component {
    static getId() {
        return "ErrorSymbol";
    }

    static getSchema() {
        // Here you define which properties should be saved to the savegame
        // and get automatically restored
        return {};
    }

    constructor() {
        super();
    }
}

export class ErrorSymbolSystem extends GameSystemWithFilter {
    errorSymbol;
    constructor(root) {
        // By specifying the list of components, `this.allEntities` will only
        // contain entities which have *all* of the specified components
        super(root, [ErrorSymbolComponent]);
        this.errorSymbol = Loader.getSprite("sprites/whocares/warning.png");
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            if (!globalConfig["foundErrors"][entity.uid]) entity.removeComponent(ErrorSymbolComponent, true);
        }
    }
    drawChunk(parameters, chunk: MapChunk) {
        const contents = chunk.containedEntitiesByLayer.regular.concat(chunk.containedEntitiesByLayer.wires);
        for (let i = 0; i < contents.length; ++i) {
            const entity: Entity = contents[i];
            if (entity.layer == "regular" && parameters.runningAfterWires) continue;
            if (entity.layer == "wires" && !parameters.runningAfterWires) continue;

            //@ts-expect-error
            const usageComp = entity.components.ErrorSymbol;
            if (!usageComp) {
                continue;
            }
            const staticComp = entity.components.StaticMapEntity;
            const context: CanvasRenderingContext2D = parameters.context;
            const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();

            // Culling for better performance
            if (parameters.visibleRect.containsCircle(center.x, center.y, 40)) {
                this.errorSymbol.drawCached(parameters, center.x - 5, center.y - 5, 10, 10);
            }
        }
    }
}
