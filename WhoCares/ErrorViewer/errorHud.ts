import { globalConfig } from "core/config";
import { makeButton, makeDiv } from "core/utils";
import { Entity } from "game/entity";
import { BaseHUDPart } from "game/hud/base_hud_part";
import { DynamicDomAttach } from "game/hud/dynamic_dom_attach";
import { enumNotificationType } from "game/hud/parts/notifications";
import { GameRoot } from "game/root";

//@ts-expect-error
import warning from "../warning.png";

export class HUDErrorViewer extends BaseHUDPart {
    element: HTMLDivElement;
    button: HTMLButtonElement;
    visible: boolean;
    edomAttach: DynamicDomAttach;
    bdomAttach: DynamicDomAttach;

    constructor(root) {
        super(root);
    }

    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_ErrorViewer");

        this.button = makeButton(document.getElementById("ingame_HUD_GameMenu"), ["styledButton"], "");
        this.button.id = "errorViewerToggle";
        this.button.style.backgroundImage = `url(${warning})`;

        this.button.addEventListener("click", () => {
            this.toggle();
        });
    }

    initialize() {
        this.visible = true;
        document.getElementById("ingame_HUD_ErrorViewer").addEventListener("click", function (event) {
            console.log("aa");
            //@ts-expect-error
            let closest: HTMLElement = event.target.closest(".WhoCaresError");
            if (closest && this.contains(closest)) {
                const root: GameRoot = globalConfig["root"];
                const entity = root.entityMgr.findByUid(Number.parseInt(closest.id), false);
                if (!entity) return;

                root.camera.center = entity.components.StaticMapEntity.origin.multiplyScalar(globalConfig["tileSize"]);
                root.hud.signals.notification.dispatch("Moved to erroring building.", enumNotificationType.info);
                root.currentLayer = entity.layer;
            }
        });
        this.visible = false;

        this.edomAttach = new DynamicDomAttach(this.root, this.element);
        this.bdomAttach = new DynamicDomAttach(this.root, this.button);
    }

    update() {
        this.edomAttach.update(this.visible);
        this.bdomAttach.update(true);
        this.updateErrors();
    }

    toggle() {
        this.visible = !this.visible;
    }
    errorDivs = [];
    createErrorDiv(error: Error, entity: Entity) {
        if (!this.visible) return;
        if (document.getElementById(entity.uid.toString())) return;
        this.errorDivs.push(entity.uid.toString());
        makeDiv(
            this.element,
            entity.uid.toString(),
            ["WhoCaresError"],
            `
       <button> <div class="name">${error.name}</div>
       <div class="message">${error.message}</div></button>
            `
        );
    }

    removeErrorDiv(uid: string) {
        if (this.visible) document.getElementById(uid).remove();
    }

    updateErrors() {
        for (const [key, value] of Object.entries(globalConfig.foundErrors)) {
            this.createErrorDiv(value.error, value.entity);
        }

        const errors = this.element.children;
        for (var i = 0; i < errors.length; i++) {
            if (!globalConfig.foundErrors[errors[i].id]) this.removeErrorDiv(errors[i].id);
        }
    }
}
