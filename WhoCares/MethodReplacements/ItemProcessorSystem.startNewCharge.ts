import { globalConfig } from "core/config";
import { registerError } from "../ErrorViewer/errorViewer";
export function startNewChargeRep($original, [entity]) {
    try {
        const processorComp = entity.components.ItemProcessor;

        // First, take items
        const items = processorComp.inputSlots;

        /** @type {Array<ProducedItem>} */
        const outItems = [];

        const handler = this.handlers[processorComp.type];
        assert(handler, "No handler for processor type defined: " + processorComp.type);

        // Call implementation
        handler({
            entity,
            items,
            outItems,
            inputCount: processorComp.inputCount,
        });

        // Track produced items
        for (let i = 0; i < outItems.length; ++i) {
            if (!outItems[i].doNotTrack) {
                this.root.signals.itemProduced.dispatch(outItems[i].item);
            }
        }

        // Queue Charge
        const baseSpeed = this.root.hubGoals.getProcessorBaseSpeed(processorComp.type);
        const originalTime = 1 / baseSpeed;

        const bonusTimeToApply = Math.min(originalTime, processorComp.bonusTime);
        const timeToProcess = originalTime - bonusTimeToApply;

        processorComp.bonusTime -= bonusTimeToApply;
        processorComp.ongoingCharges.push({
            items: outItems,
            remainingTime: timeToProcess,
        });

        processorComp.inputSlots.clear();
        processorComp.inputCount = 0;
    } catch (e) {
        //forceLoadBypassLogger.log("Forceloading past startNewCharge error.");
        if (!globalConfig["forceload"]) {
            this.root.gameState.saveThenGoToState("MainMenuState", { loadError: e });
            throw e;
        }
        registerError(e, entity, "Item Processor System");
    }
}
