import { FormElementInput } from "core/modal_dialog_forms";
import { Vector } from "core/vector";
import { enumShortcodeToColor } from "game/colors";
import { HUDConstantSignalEdit } from "game/hud/parts/constant_signal_edit";
import { ShapeItem } from "game/items/shape_item";
import { ShapeDefinition, ShapeLayer, enumShortcodeToSubShape } from "game/shape_definition";
import { ShapeDefinitionManager } from "game/shape_definition_manager";
import { Mod } from "mods/mod";
import index from "./index.pug";

const SHORT_KEY_CACHE = new Map();
export default class extends Mod {
    override init() {
        this.metadata.extra.readme = index;
        this.modInterface.replaceMethod(ShapeDefinition, "getHash", function () {
            this.cachedHash = JSON.stringify(this.layers);
            return this.cachedHash;
        });

        this.modInterface.extendObject(ShapeDefinition, ShapeDefinitionStaticExt);

        this.modInterface.replaceMethod(HUDConstantSignalEdit, "parseSignalCode", function ($original, [entity, code]) {
            if (!this.root || !this.root.shapeDefinitionMgr) {
                // Stale reference
                return null;
            }

            if (!ShapeDefinition.isValidShortKey(code)) return $original(entity, code);

            code = shortKeyToJson(code);

            return this.root.shapeDefinitionMgr.getShapeItemFromShortKey(code);
        });
        this.modInterface.replaceMethod(FormElementInput, "getHtml", function () {
            let classes = [];
            let inputType = "text";
            let maxlength = 1000;
            switch (this.inputType) {
                case "text": {
                    classes.push("input-text");
                    break;
                }

                case "email": {
                    classes.push("input-email");
                    inputType = "email";
                    break;
                }

                case "token": {
                    classes.push("input-token");
                    inputType = "text";
                    maxlength = 4;
                    break;
                }
            }
            console.log("this.defaultValue");
            console.log(this.defaultValue);
            return `
                <div class="formElement input">
                    ${this.label ? `<label>${this.label}</label>` : ""}
                    <input
                        type="${inputType}"
                        value="${this.defaultValue.replace ? this.defaultValue.replaceAll(/[\\]+/gi, "").replaceAll('"', "&quot;") : JSON.stringify(this.defaultValue)}"
                        maxlength="${maxlength}"
                        autocomplete="off"
                        autocorrect="off"
                        autocapitalize="off"
                        spellcheck="false"
                        class="${classes.join(" ")}"
                        placeholder="${this.placeholder.replace(/["\\]+/gi, "")}"
                        data-formId="${this.id}">
                </div>
            `;
        });
        this.modInterface.extendClass(ShapeDefinitionManager, ShapeDefinitionManagerExt);
        const arrayQuadrantIndexToOffset = [
            new Vector(1, -1), // tr
            new Vector(1, 1), // br
            new Vector(-1, 1), // bl
            new Vector(-1, -1), // tl
        ];
    }
}
const ShapeDefinitionStaticExt = ({ $super, $old }) => ({
    fromJson(json) {
        const definition = new ShapeDefinition({ layers: json });
        return definition;
    },
    fromShortKey(key) {
        key = isJson(key) ? JSON.parse(key) : key;
        if (typeof key != "string") return this.fromJson(key);
        return $old.fromShortKey(key);
    },
    isValidShortKey(key) {
        if (SHORT_KEY_CACHE.has(JSON.stringify(key))) {
            return SHORT_KEY_CACHE.get(JSON.stringify(key));
        }

        const result = ShapeDefinition.isValidShortKeyInternal(key);
        SHORT_KEY_CACHE.set(JSON.stringify(key), result);
        if (!result) console.log(key);
        if (!result && !isJson(key)) return $old.isValidShortKey(key);
        else return result;
    },

    isValidShortKeyInternal(key) {
        key = isJson(key) ? JSON.parse(key) : key;
        if (typeof key !== "string") {
            if (key.length === 0 || key.length > 4) {
                return false;
            }
            for (let i = 0; i < key.length; ++i) {
                if (key[i].length != 4) return false;
                if (key[i].every((x, i) => x === null)) return false;
            }
            return true;
        }

        return $old.isValidShortKeyInternal(key);
    },
});

const ShapeDefinitionManagerExt = ({ $super, $old }) => ({
    getShapeItemFromShortKey(hash: string) {
        hash = isJson(hash) ? JSON.parse(hash) : hash;
        if (typeof hash === "string") {
            const cached = this.shapeKeyToItem[hash];
            if (cached) {
                return cached;
            }
            const definition = this.getShapeFromShortKey(hash);
            return (this.shapeKeyToItem[hash] = new ShapeItem(definition));
        } else {
            const definition = new ShapeDefinition({ layers: hash });
            return new ShapeItem(definition);
        }
    },
});

function isJson(string) {
    try {
        JSON.parse(string);
        return true;
    } catch {
        return false;
    }
}
function shortKeyToJson(key) {
    key = isJson(key) ? JSON.parse(key) : key;
    if (typeof key !== "string") return key;
    const sourceLayers = key.split(":");
    let layers = [];
    for (let i = 0; i < sourceLayers.length; ++i) {
        const text = sourceLayers[i];
        assert(text.length === 8, "Invalid shape short key: " + key);

        /** @type {ShapeLayer} */
        const quads = [null, null, null, null];
        for (let quad = 0; quad < 4; ++quad) {
            const shapeText = text[quad * 2 + 0];
            const subShape = enumShortcodeToSubShape[shapeText];
            const color = enumShortcodeToColor[text[quad * 2 + 1]];
            if (subShape) {
                assert(color, "Invalid shape short key:", key);
                quads[quad] = {
                    subShape,
                    color,
                };
            } else if (shapeText !== "-") {
                assert(false, "Invalid shape key: " + shapeText);
            }
        }
        layers.push(quads);
    }
    return layers;
}
