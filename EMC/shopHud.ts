import { DialogWithForm } from "core/modal_dialog_elements";
import { FormElementInput } from "core/modal_dialog_forms";
import { STOP_PROPAGATION } from "core/signal";
import { enumMouseButton } from "game/camera";
import { BaseHUDPart } from "game/hud/base_hud_part";
import { ShapeDefinition } from "game/shape_definition";

export class HUDShapeBuyerEdit extends BaseHUDPart {
    initialize() {
        this.root.camera.downPreHandler.add(this.downPreHandler, this);
    }

    /**
     * @param {Vector} pos
     * @param {enumMouseButton} button
     */
    downPreHandler(pos, button) {
        if (this.root.currentLayer !== "regular") {
            return;
        }

        const tile = this.root.camera.screenToWorld(pos).toTileSpace();
        const contents = this.root.map.getLayerContentXY(tile.x, tile.y, "regular");
        if (contents) {
            //@ts-expect-error
            const shapeBuyerComp = contents.components.ShapeBuyer;
            if (shapeBuyerComp) {
                if (button === enumMouseButton.left) {
                    this.editShapeBuyerText(contents, {
                        deleteOnCancel: false,
                    });
                    return STOP_PROPAGATION;
                }
            }
        }
    }

    /**
     * Asks the player to enter a shapeBuyer text
     * @param {Entity} entity
     * @param {object} param0
     * @param {boolean=} param0.deleteOnCancel
     */
    editShapeBuyerText(entity, { deleteOnCancel = true }) {
        const shapeBuyerComp = entity.components.ShapeBuyer;
        if (!shapeBuyerComp) {
            return;
        }

        // save the uid because it could get stale
        const uid = entity.uid;

        // create an input field to query the text
        const textInput = new FormElementInput({
            id: "shapeBuyerText",
            placeholder: "",
            defaultValue: shapeBuyerComp.shape,
            validator: (val) => ShapeDefinition.isValidShortKey(val),
        });

        // create the dialog & show it
        const dialog = new DialogWithForm({
            app: this.root.app,
            title: "Edit Shape",
            desc: "Enter a valid shape key. (Ex: CuCuCuCu)",
            formElements: [textInput],
            buttons: ["cancel:bad:escape", "ok:good:enter"],
            closeButton: false,
        });
        this.root.hud.parts.dialogs.internalShowDialog(dialog);

        // When confirmed, set the text
        //@ts-expect-error
        dialog.buttonSignals.ok.add(() => {
            if (!this.root || !this.root.entityMgr) {
                // Game got stopped
                return;
            }

            const entityRef = this.root.entityMgr.findByUid(uid, false);
            if (!entityRef) {
                // outdated
                return;
            }

            //@ts-expect-error
            const shapeBuyerComp = entityRef.components.ShapeBuyer;
            if (!shapeBuyerComp) {
                // no longer interesting
                return;
            }

            // set the text
            shapeBuyerComp.shape = textInput.getValue();
        });

        // When cancelled, destroy the entity again
        if (deleteOnCancel) {
            //@ts-expect-error
            dialog.buttonSignals.cancel.add(() => {
                if (!this.root || !this.root.entityMgr) {
                    // Game got stopped
                    return;
                }

                const entityRef = this.root.entityMgr.findByUid(uid, false);
                if (!entityRef) {
                    // outdated
                    return;
                }

                //@ts-expect-error
                const shapeBuyerComp = entityRef.components.ShapeBuyer;
                if (!shapeBuyerComp) {
                    // no longer interesting
                    return;
                }

                this.root.logic.tryDeleteBuilding(entityRef);
            });
        }
    }
}
