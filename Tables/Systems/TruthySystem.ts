import { GameSystemWithFilter } from "game/game_system_with_filter";
import { isTruthyItem } from "game/items/boolean_item";
import type { GameRoot } from "game/root";
import { TruthyBuildingComponent } from "../Components/TruthyComponent";

export class TruthySystem extends GameSystemWithFilter {
    constructor(root: GameRoot) {
        // By specifying the list of components, `this.allEntities` will only
        // contain entities which have *all* of the specified components
        super(root, [TruthyBuildingComponent]);

        // Ask for a truthy text once an entity is placed
        this.root.signals.entityManuallyPlaced.add((entity: any) => {
            const editorHud = this.root.hud.parts.truthyBlockEdit;
            if (editorHud) {
                editorHud.editTruthyTable(entity, { deleteOnCancel: true });
            }
        });
    }

    override update() {
        if (!this.root.gameInitialized) {
            // Do not start updating before the wires network was
            // computed to avoid dispatching all truthys
            return;
        }

        // Go over all truthy blocks and check if the signal changed
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];

            // Compute if the bottom pin currently has a truthy input
            const pinsComp = entity!.components.WiredPins;
            const network = pinsComp.slots[0]!.linkedNetwork;

            let currentInput = false;

            if (network && network.hasValue()) {
                const value = network.currentValue;
                if (value && isTruthyItem(value)) {
                    currentInput = true;
                }
            }

            // If the value changed, show the truthy if its truthy
            const truthyComp = entity!.components.TruthyBlock;
            const truthyTable = truthyComp.truthyTable;
            if (truthyComp.deleteMe <= 100) console.log(truthyTable);
            else truthyComp.deleteMe++;
        }
    }
}
