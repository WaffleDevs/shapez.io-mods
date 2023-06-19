import { Mod } from "mods/mod";

export default class extends Mod {
    override init() {
        const quitApp = () => {this.app.platformWrapper.exitApp();}
        document.onkeydown = function(evt) {
            evt = evt || window.event;
            if(evt.altKey && evt.key == "F4") quitApp();
        };
    }
}