import { globalConfig } from "core/config";

export function initializeSavegameFunctions(mod) {
    mod.signals.gameSerialized.add((root, data) => {
        data.modExtraData["emc:storedAmount"] = globalConfig["storedEmc"];
    });

    mod.signals.gameDeserialized.add((root, data) => {
        globalConfig["storedEmc"] = data.modExtraData["emc:storedAmount"];
    });
}
