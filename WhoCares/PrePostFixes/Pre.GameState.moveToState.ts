import { globalConfig } from "core/config";

export function moveToStatePre(stateKey, payload, skipFadeOut) {
    try {
        console.log(payload["savegame"]);
    } catch (error) {}
    //if (payload != undefined && payload.forceLoad) console.log("FORCELOAD\nFORCELOAD\nFORCELOAD\n");
    if (stateKey == "InGameState" && payload != undefined && payload.savegame != undefined) globalConfig["latestSavegame"] = payload["savegame"];
}
