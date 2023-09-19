import { globalConfig } from "core/config";
import { HUDPinnedShapes } from "game/hud/parts/pinned_shapes";
import { ShapeDefinition } from "game/shape_definition";
import { Mod } from "mods/mod";

export const emcShape = "------:RyCyCyCy:CwCwCwCw";

export function hasEnoughEmc(amount) {
    return globalConfig["root"].hubGoals.storedShapes[emcShape] >= amount;
}

export function hasEnoughEmcForShape(shape: ShapeDefinition | String) {
    //@ts-expect-error 1
    if (typeof shape != "string") shape = shape.cachedHash;
    return hasEnoughEmc(emcForShape(shape as String));
}

export function emcForShape(shape: String) {
    const weights = globalConfig["emcWeights"];
    const sW = weights.shapes;
    const cW = weights.colors;
    const lW = weights.layers;

    let emc = 0;
    const layers = shape.split(":");
    for (let l = 0; l < layers.length; l++) {
        for (let q = 0; q < 4; q++) {
            // Run for all quads
            const quad = layers[l].slice(q * 2, 2 * q + 2);
            const shape = sW[quad[0]] ? sW[quad[0]] : 1.5;
            const color = cW[quad[1]] ? cW[quad[1]] : 1.25;

            emc += shape * color;
        }
    }

    return Math.round(emc * lW[layers.length - 1]);
}

export function subtractEmc(amount) {
    globalConfig["root"].hubGoals.storedShapes[emcShape] -= amount;
    if (globalConfig["root"].hubGoals.storedShapes[emcShape] < 0) globalConfig["root"].hubGoals.storedShapes[emcShape] = 0;
}

export function addEmc(amount) {
    globalConfig["root"].hubGoals.storedShapes[emcShape] += amount;
}

export function subtractASEmc(shape) {
    subtractEmc(emcForShape(shape));
}

export function addAsEmc(shape) {
    addEmc(emcForShape(shape));
}

export function initEmcViewer(mod: Mod) {
    // Make sure the currency is always pinned
    mod.modInterface.runAfterMethod(HUDPinnedShapes, "rerenderFull", function () {
        this.internalPinShape({
            key: emcShape,
            canUnpin: false,
            className: "emc",
        });
    });
}
