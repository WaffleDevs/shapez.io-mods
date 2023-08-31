const functions = {};

export function registerModFix(id, func, when) {
    functions[id] = { func, when };
}

export function runPossibleFixed(now): [{}, string[]] {
    let returnFuncs = {};
    let returnIds = [];
    for (const id in functions) {
        const { func, when } = functions[id];
        if (now == when) {
            returnFuncs[id] = func;
            returnIds.push(id);
        }
    }
    return [returnFuncs, returnIds];
}
