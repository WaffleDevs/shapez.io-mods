import { globalConfig } from "core/config";
import { enumPinSlotType } from "game/components/wired_pins";
import { registerError } from "../ErrorViewer/errorViewer";
export function updateRep($original) {
    for (let i = 0; i < this.allEntities.length; ++i) {
        const entity = this.allEntities[i];

        try {
            const logicComp = entity.components.LogicGate;
            const slotComp = entity.components.WiredPins;
            const slotValues = [];

            // Store if any conflict was found
            let anyConflict = false;

            // Gather inputs from all connected networks
            for (let i = 0; i < slotComp.slots.length; ++i) {
                const slot = slotComp.slots[i];
                if (slot.type !== enumPinSlotType.logicalAcceptor) {
                    continue;
                }
                const network = slot.linkedNetwork;
                if (network) {
                    if (network.valueConflict) {
                        anyConflict = true;
                        break;
                    }
                    slotValues.push(network.currentValue);
                } else {
                    slotValues.push(null);
                }
            }

            // Handle conflicts
            if (anyConflict) {
                for (let i = 0; i < slotComp.slots.length; ++i) {
                    const slot = slotComp.slots[i];
                    if (slot.type !== enumPinSlotType.logicalEjector) {
                        continue;
                    }
                    slot.value = null;
                }
                continue;
            }

            // Compute actual result
            const result = this.boundOperations[logicComp.type](slotValues);

            if (Array.isArray(result)) {
                let resultIndex = 0;
                for (let i = 0; i < slotComp.slots.length; ++i) {
                    const slot = slotComp.slots[i];
                    if (slot.type !== enumPinSlotType.logicalEjector) {
                        continue;
                    }
                    slot.value = result[resultIndex++];
                }
            } else {
                // @TODO: For now we hardcode the value to always be slot 0
                assert(slotValues.length === slotComp.slots.length - 1, "Bad slot config, should have N acceptor slots and 1 ejector");
                assert(slotComp.slots[0].type === enumPinSlotType.logicalEjector, "Slot 0 should be ejector");
                slotComp.slots[0].value = result;
            }
        } catch (error) {
            if (globalConfig["forceload"]) {
                registerError(error, entity);
            } else {
                this.root.gameState.saveThenGoToState("MainMenuState", { loadError: error });
                throw error;
            }
        }
    }
}
