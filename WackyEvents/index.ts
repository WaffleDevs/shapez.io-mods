import type { GameRoot } from "game/root";
import { Mod } from "mods/mod";

export default class RandomEvents extends Mod {
    override init() {
        this.signals.stateEntered.add((state) => {
            if (state.key === "PreloadState") {
                window.REL.registerStateEnterEvent(
                    "CloseGame",
                    "MainMenuState",
                    () => {
                        this.app.platformWrapper.exitApp();
                    },
                    "WackyEvents"
                );
                window.REL.registerStateEnterEvent(
                    "CloseGaame",
                    "MainMenuState",
                    () => {
                        this.app.platformWrapper.exitApp();
                    },
                    "WackyEvents"
                );

                const wackyIRE = {
                    Roar: () => {
                        const audio = new Audio(
                            "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3"
                        );
                        audio.volume = 0.2;
                        audio.play();
                    },
                    AutosaveClose: (root: GameRoot) => {
                        root.automaticSave.doSave();
                        setTimeout(() => {
                            this.app.platformWrapper.exitApp();
                        }, 1000);
                    },
                };
                window.REL.registerBulkIngameRandomEvent(wackyIRE, "WackyEvents");
            }
        });
    }
}