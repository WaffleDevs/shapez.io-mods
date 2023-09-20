import { globalConfig } from "core/config";
import { HUDPinnedShapes } from "game/hud/parts/pinned_shapes";
import { ShapeDefinition } from "game/shape_definition";
import { Mod } from "mods/mod";
import { getMod } from "shapez-env";

export const emcShape = "------:RyCyCyCy:CwCwCwCw";

export function hasEnoughEmc(root, amount) {
    return root.hubGoals.storedShapes[emcShape] >= amount;
}

export function hasEnoughEmcForShape(root, shape: ShapeDefinition | String) {
    //@ts-expect-error
    if (typeof shape != "string") shape = shape.cachedHash;
    return hasEnoughEmc(root, emcForShape(shape as String, false));
}
const isAStupidIdiotUsingCompactMachinesModLikeAnIdiot = getMod("compact");
export function emcForShape(shape: String, input) {
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

            if (input) emc += shape * color;
            else emc += Math.pow(shape * color, lW[layers.length - 1]);
        }
    }
    if (isAStupidIdiotUsingCompactMachinesModLikeAnIdiot && input) return 1;
    return Math.round(emc + 1);
}

export function subtractEmc(root, amount) {
    root.hubGoals.storedShapes[emcShape] -= amount;
    if (root.hubGoals.storedShapes[emcShape] < 0) root.hubGoals.storedShapes[emcShape] = 0;
}

export function addEmc(root, amount) {
    root.hubGoals.storedShapes[emcShape] += amount;
}

export function subtractASEmc(root, shape) {
    subtractEmc(root, emcForShape(shape, false));
}

export function addAsEmc(root, shape) {
    addEmc(root, emcForShape(shape, true));
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
