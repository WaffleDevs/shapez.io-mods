import * as path from "path";
import { readFile } from "fs/promises";
import { formatAsBanner, modFilePathToId, modFileToMetadataPath } from "./util.js";
import { existsSync, readFileSync } from "fs";
import json from "@rollup/plugin-json";

/** @type {{ [k: string]: { name: string, email?: string, icon?: string } }} */
const authors = JSON.parse(await readFile("./authors.json", "utf-8"));

/**
 * @param {string | undefined} id
 */
function resolveAuthor(id) {
    return id ? authors[id] ?? id : authors[Object.keys(authors)[0]];
}

/**
 * Resolves the author, adds a website polyfill etc. but DOES NOT
 * add icon, README or changelog.
 * @param {string} id
 * @param {{
 *     name: string,
 *     description: string,
 *     version: string,
 *     authors?: string[],
 *     affectsSavegame?: boolean,
 *     extra: { authors?: { name: string, email?: string, icon?: string }[], updateURL?: string }
 *     [k: string]: any
 * }} metadata
 */
function expandBasicMetadata(id, metadata) {
    metadata.id = id;
    metadata.extra ??= {};

    const authors = metadata.authors || [undefined];
    metadata.extra.authors = authors.map(resolveAuthor);
    metadata.author = metadata.extra.authors.map((author) => author.name).join(", ");
    delete metadata.authors;

    const affectsSavegame = metadata.affectsSavegame ?? true;
    metadata.doesNotAffectSavegame = !affectsSavegame;
    delete metadata.affectsSavegame;

    metadata.website = `https://skimnerphi.net/mods/${id}`
    metadata.extra.updateURL = `https://skimnerphi.net/api/v1/latest/${id}`

    return metadata;
}

/**
 * Transforms mod.json into a module with resolved metadata.
 * @param {string} id
 * @param {string} json
 */
function resolveMetadata(id, json) {
    const metadata = JSON.parse(json);
    const result = expandBasicMetadata(id, metadata);

    let code = `const metadata = ${JSON.stringify(result)};`;

    const checkFiles = ["README.md", "changelog.json", "icon.webp"];
    const [hasReadme, hasChangelog, hasIcon] = checkFiles.map((file) => {
        return existsSync(path.join(id, file));
    });

    if (hasReadme) {
        code = `import r from "./README.md";${code}metadata.extra.readme = r;`;
    }

    if (hasChangelog) {
        code = `import c from "./changelog.json";${code}metadata.extra.changelog = c;`;
        MEChangelogToSkimnetVerions(id, result)
    }

    if (hasIcon) {
        code = `import i from "./icon.webp";${code}metadata.extra.icon = i;`;
    }

    return code + `export default metadata`;
}

/**
 * A plugin to transform mod.json into metadata readable by the game
 * and insert a metadata banner.
 * @returns {import("rollup").Plugin}
 */
export function shapezMetadata() {
    return {
        name: "shapez-metadata",
        buildStart() { },
        async banner(chunk) {
            if (!chunk.isEntry || !chunk.facadeModuleId) {
                return "";
            }

            const metadataPath = modFileToMetadataPath(chunk.facadeModuleId);
            const modId = modFilePathToId(metadataPath);

            const metadataJson = await readFile(metadataPath, "utf-8");
            const expanded = expandBasicMetadata(modId, JSON.parse(metadataJson));

            const info = `Name: ${expanded.name}
            Description: ${expanded.description}
            Version: ${expanded.version}
            Author(s): ${expanded.author}`;
            return formatAsBanner(info);
        },
        transform(code, moduleId) {
            if (moduleId.split(path.sep).at(-1) !== "mod.json") {
                return null;
            }

            const id = modFilePathToId(moduleId);
            this.addWatchFile(path.join(id, "README.md"));
            this.addWatchFile(path.join(id, "changelog.json"));
            this.addWatchFile(path.join(id, "icon.webp"));

            return {
                code: resolveMetadata(id, code),
                // TODO: Generate damn source map
                map: null,
            };
        },
    };
}


/**
 * Resolves the author, adds a website polyfill etc. but DOES NOT
 * add icon, README or changelog.
 * @param {string} id
 * @param {{
*     name: string,
*     description: string,
*     version: string,
*     authors?: string[],
*     affectsSavegame?: boolean,
*     extra: { authors?: { name: string, email?: string, icon?: string }[], updateURL?: string }
*     [k: string]: any
* }} metadata
*/
export async function MEChangelogToSkimnetVerions(id, metadata) {
    /** 
    *  @type {[]}
    */
    const changelog = JSON.parse(await readFile(path.join(id, "changelog.json"), 'utf-8'))
    const result = Object.entries(changelog).map(([key, val]) => {
        return {
            "version": key,
            "changelog": val
        }
    })
}