/**
 * Please ignore everything here. This is entirely to build mod data to send to skimnerphi for updating his website. He has yet to do so 5 days after I asked him too.
 */


import { appendFile, appendFileSync, copyFileSync, existsSync, mkdir, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import * as path from "path";
import { expandBasicMetadata } from './metadata.js';
/**
    * @typedef {{
    * name:string
    * version:string
    * description:string
    * authors?: string[],
    * affectsSavegame?: boolean,
    * extra: { authors?: { name: string, email?: string, icon?: string }[], updateURL?: string }
    * [k: string]: any
    * }} metadata
 */

/** 
 * @param {string} id
 * @param {metadata} metadata
 * */
export function createNewRelease(id, metadata) {
    console.log(id)
    mkdirSync(path.join('Releases', id));
    mkdirSync(path.join('Releases', id, 'files'));
    mkdirSync(path.join('Releases', id, 'res'));
}
/** 
 * @param {string[]} files
 * @param {string} id
 * @param {metadata} metadata
* */
export function writeNewRelease(files, id, metadata) {
    if (!files.includes('changelog.json')) return;
    if (!existsSync(path.join('Releases', id))) createNewRelease(id, metadata);
    const version = versionMetaData(files, id, metadata)
    copyFileSync(path.join('build', `${id}.mod.js`), path.join('Releases', id, `files/${id}@${version}.mod.js`))
    if (existsSync(path.join(id, 'index.pug'))) {
        copyFileSync(path.join(id, 'index.pug'), path.join('Releases', id, 'files/index.pug'))
        //appendFileSync(path.join('Releases',id,'files/index.pug'), "extends ../mod.pug\n")
        const pugText = `extends ../mod.pug\n${readFileSync(path.join('Releases', id, 'files/index.pug'), { encoding: 'utf8', flag: 'r' })}`
        writeFileSync(path.join('Releases', id, 'files/index.pug'), pugText)
    }
    else {
        writeFileSync(path.join('Releases', id, 'files/index.pug'), `extends ../mod.pug
block content
    h1.
        ${id}
    h2.
        Latest: ${metadata.version}
    p.
        ${metadata.author}
    p.
        ${metadata.description}`)
    }
    if (existsSync(path.join(id, 'icon.webp'))) copyFileSync(path.join(id, 'icon.webp'), path.join('Releases', id, 'res/icon.webp'))
}



/** 
 * @param {string[]} files
 * @param {string} id
 * @param {metadata} metadata
* */
export function versionMetaData(files, id, metadata) {
    /** 
    *  @type {[]}
    */
    const changelog = JSON.parse(readFileSync(path.join(id, "changelog.json"), { encoding: 'utf8', flag: 'r' }))
    const changelogResult = Object.entries(changelog).map(([key, val]) => {
        return {
            "version": key,
            "changelog": val
        }
    })

    writeFileSync(path.join('Releases', id, 'files/versions.json'), JSON.stringify(changelogResult))


    const modInfoResult = {
        "id": id,
        "version": metadata.version,
        "name": metadata.name,
        "author": metadata.author,
        "description": metadata.description
    }
    writeFileSync(path.normalize(path.join('Releases', id, 'files/info.json')), JSON.stringify(modInfoResult))
    return metadata.version
}


export default function skimnet() {
    return {
        name: "skimnet",
        /**
         * @param {any} options
         * @param {{[k:string]: any}} bundle
         * @param {boolean} isWrite
         */
        writeBundle(options, bundle, isWrite) {
            const data = bundle[Object.keys(bundle)[0]]
            const folderPath = path.resolve(data.facadeModuleId, '..')
            const id = data.fileName.split('.')[0]
            /** @type {string[]} */
            const files = data.moduleIds.flatMap((/** @type {string} */ id) => id.replace(folderPath, '').replace('\\', ''));
            const modInfo = JSON.parse(readFileSync(path.join(id, "mod.json"), { encoding: 'utf8', flag: 'r' }))
            const expanded = expandBasicMetadata(id, modInfo)
            writeNewRelease(files, id, expanded);
        }
    }
}