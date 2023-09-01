export function fixCCT() {
    //@ts-expect-error
    if (entity.components.CommandController && !entity.components.CommandController.command.startsWith("return;"))
        //@ts-expect-error
        entity.components.CommandController.command = `return;\n${entity.components.CommandController.command}`;
}
