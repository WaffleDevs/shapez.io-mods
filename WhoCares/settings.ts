import { Mod } from "mods/mod";

let WhoCares: Mod;

export function initializeSettings(mod: Mod) {
    WhoCares = mod;
}

export function setSettings(setting, set, data, key?) {
    if (WhoCares.settings[setting] == undefined) WhoCares.settings[setting] = {};
    if (WhoCares.settings[setting][key] == undefined) WhoCares.settings[setting][key] = "";
    if (set) {
        WhoCares.settings[setting] = data;
    } else {
        WhoCares.settings[setting][key] = data;
    }

    WhoCares.saveSettings();
}
export function getSettings(setting, key) {
    //console.log(setting, key, WhoCares.settings[setting][key]);
    return WhoCares.settings[setting][key];
}
