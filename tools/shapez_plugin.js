import { modFilePathToId, modFileToMetadataPath } from "./util.js";

const shapezEnv = "\0shapez-env";

/**
 * Provides the shapez-env module based on imported module ID.
 * @param {string} id
 */
function loadShapezEnv(id) {
    if (!id.startsWith(shapezEnv)) {
        return null;
    }

    const modId = JSON.stringify(id.split("/")[1]);
    return `import { MODS } from "mods/modloader";
            export const getMod = (id) => {
                if(!id) id = ${modId}
                return MODS.mods.find(m => m.metadata.id === id)
            }
            `;
}

/**
 * A plugin to insert metadata import and mod registry code,
 * as well as provide virtual shapez-env module
 * @returns {import("rollup").Plugin}
 */
export function shapez() {
    return {
        name: "shapez",
        resolveId(id, importer) {
            if (!importer) {
                return null;
            }

            const modId = modFilePathToId(importer);
            return id === "shapez-env" ? `${shapezEnv}/${modId}` : null;
        },
        load: loadShapezEnv,
        footer(chunk) {
            if (!chunk.isEntry) {
                return "";
            }

            return "$shapez_registerMod(m.default,m.m)";
        },
        transform(code, moduleId) {
            const moduleInfo = this.getModuleInfo(moduleId);
            if (!moduleInfo?.isEntry) {
                return null;
            }

            const metadataPath = modFileToMetadataPath(moduleId);
            const result = `export { default as m } from ${JSON.stringify(metadataPath)};
            ${code}`;

            return {
                code: result,
                // TODO: Generate source map (?) not sure if needed
                map: null,
            };
        },
    };
}
