import { DialogWithForm } from "core/modal_dialog_elements";
import { STOP_PROPAGATION } from "core/signal";
import { enumMouseButton } from "game/camera";
import { BaseHUDPart } from "game/hud/base_hud_part";
import { TruthyBuildingComponent } from "../Components/TruthyComponent";
import { getOrRegisterTableBuilding, truthyTableToId, validateTruthyTable } from "..";
import { MultilineFormElementInput } from "../Elements/MultilineFormElementInput";
import type { MetaBuilding } from "game/meta_building";

export class HUDTruthyTableEdit extends BaseHUDPart {
    override initialize() {
        this.root.camera.downPreHandler.add(this.downPreHandler, this);
    }

    /**
     * @param {Vector} pos
     * @param {enumMouseButton} button
     */
    downPreHandler(pos: any, button: any): any {
        if (this.root.currentLayer !== "wires") {
            return;
        }

        const tile = this.root.camera.screenToWorld(pos).toTileSpace();
        const contents = this.root.map.getLayerContentXY(tile.x, tile.y, "wires");
        if (contents) {
            // @ts-ignore
            const truthyComp = contents.components.TruthyBlock;
            if (truthyComp) {
                if (button === enumMouseButton.left) {
                    // @ts-ignore
                    this.editTruthyTable(contents, {
                        deleteOnCancel: false,
                    });
                    return STOP_PROPAGATION;
                }
            }
        }
    }

    /**
     * Asks the player to enter a truthy text
     * @param {Entity} entity
     * @param {object} param0
     * @param {boolean=} param0.deleteOnCancel
     */
    editTruthyTable(
        entity: { components: { TruthyBlock: any }; uid: any },
        { deleteOnCancel = true }: { deleteOnCancel: boolean }
    ) {
        const truthyComp: TruthyBuildingComponent = entity.components.TruthyBlock;
        if (!truthyComp) {
            return;
        }

        // save the uid because it could get stale
        const uid = entity.uid;

        // create an input field to query the text
        const textInput = new MultilineFormElementInput({
            id: "truthyTable",
            placeholder: "",
            defaultValue: truthyComp.truthyTable.replaceAll("_", "\n"),
            validator: (val: string) => {
                return validateTruthyTable(val);
            },
        });

        // create the dialog & show it
        const dialog = new DialogWithForm({
            app: this.root.app,
            title: "Edit Truthy Table",
            desc: "Enter a valid Truthy Table. If it is invalid, the input will be red.",
            formElements: [textInput],
            buttons: ["cancel:bad:escape", "ok:good"],
            closeButton: false,
        });

        this.root.hud.parts.dialogs.internalShowDialog(dialog);

        // When confirmed, set the text
        // @ts-ignore
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

            // @ts-ignore
            const truthyComp: TruthyBuildingComponent = entityRef.components.TruthyBlock;
            if (!truthyComp) {
                // no longer interesting
                return;
            }

            // set the text
            truthyComp.truthyTable = textInput.getValue().trim().replaceAll("\n", "_");
            console.log(truthyComp.truthyTable);

            let metaBuilding: MetaBuilding = getOrRegisterTableBuilding(
                truthyTableToId(truthyComp.truthyTable)
            );

            const { rotation, rotationVariant } =
                metaBuilding.computeOptimalDirectionAndRotationVariantAtTile({
                    root: this.root,
                    tile: entityRef.components.StaticMapEntity.origin,
                    rotation: entityRef.components.StaticMapEntity.rotation,
                    variant: entityRef.components.StaticMapEntity.getVariant(),
                    layer: entityRef.layer,
                });

            const entity = this.root.logic.tryPlaceBuilding({
                origin: entityRef.components.StaticMapEntity.origin,
                rotation,
                rotationVariant,
                originalRotation:
                    entityRef.components.StaticMapEntity.getRotationVariant(),
                building: metaBuilding,
                variant: entityRef.components.StaticMapEntity.getVariant(),
            });

            if (entity) {
                // Succesfully placed, find which entity we actually placed
                this.root.signals.entityManuallyPlaced.dispatch(entity);
            }
            //const entityRef2 = this.root.entityMgr.findByUid(entity.uid, false);

            this.root.logic.tryDeleteBuilding(entityRef);
        });

        // When cancelled, destroy the entity again
        if (deleteOnCancel) {
            // @ts-ignore
            dialog.buttonSignals.cancel.add(() => {
                if (!this.root || !this.root.entityMgr) {
                    // Game got stopped-
                    return;
                }

                const entityRef = this.root.entityMgr.findByUid(uid, false);
                if (!entityRef) {
                    // outdated
                    return;
                }

                // @ts-ignore
                const truthyComp = entityRef.components.TruthyBlock;
                if (!truthyComp) {
                    // no longer interesting
                    return;
                }

                this.root.logic.tryDeleteBuilding(entityRef);
            });
        }
    }
}
