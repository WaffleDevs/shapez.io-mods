// https://github.com/dengr1065/shapez-mods/blob/master/lib/me_stub/index.ts
// All code in this file is owned dengr1065

import { GameState } from "core/game_state";
import { Signal } from "core/signal";
import { Mod } from "mods/mod";
import { T } from "translations";

const GET_MOD_EXTRAS_URL = "https://skimnerphi.net/mods/mod_extras/";

declare global {
    interface Window {
        ModExtras: any;
    }
}

function getMEVersion(): string | null {
    return ("ModExtras" in window && window.ModExtras.version) || null;
}

function showMissingDialog(mod: Mod, optional: boolean = false) {
    const { getModExtras }: { [k: string]: Signal } = mod.dialogs.showWarning(
        "Mod Extras Missing",
        optional
            ? `Mod "${mod.metadata.name}" recommends an up-to-date
        version of Mod Extras to function properly.`
            : `Mod "${mod.metadata.name}" requires an up-to-date
        version of Mod Extras to function properly.`,
        ["later:bad", "getModExtras:good"]
    );

    getModExtras!.add(() => {
        mod.app.platformWrapper.openExternalLink(GET_MOD_EXTRAS_URL);
    });
}

export function requireModExtras(mod: Mod, optional: boolean = false) {
    const version = getMEVersion();
    const signal = mod.signals.stateEntered;

    function onStateEntered(this: any, state: GameState) {
        if (state.key === "MainMenuState") {
            showMissingDialog(mod, optional);
            signal.remove(this);
        }
    }

    if (version === null) {
        T.dialogs.buttons.getModExtras = "Get Mod Extras";
        signal.add(onStateEntered, onStateEntered);
    }

    return version !== null;
}
