import WhoCares from "..";

export function moveToStatePre(stateKey, payload, skipFadeOut) {
    //if (payload != undefined && payload.forceLoad) console.log("FORCELOAD\nFORCELOAD\nFORCELOAD\n");
    if (stateKey == "InGameState" && payload != undefined && payload.savegame != undefined) WhoCares.prototype.latestSavegame = payload["savegame"];
}
