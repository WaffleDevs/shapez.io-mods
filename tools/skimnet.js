import { existsSync, mkdirSync } from 'fs';
import * as path from "path";


/** 
 * @param {{
 *    [k: string]: any,
 *    name: string,
 *    description: string,
 *    version: string,
 *    authors?: string[] | undefined,
 *    affectsSavegame?: boolean | undefined,
 *    extra: {
 *        authors?: {
 *            name: string,
 *            email?: string | undefined,
 *            icon?: string | undefined,
 *        }[] | undefined,
 *        updateURL?: string | undefined,
 *    }
 *    }} metadata 
 * */
export function createNewRelease(metadata) {
    console.log(path.join('releases', metadata.Name))
    if (existsSync(path.join('releases', metadata.Name))) return;
    mkdirSync(path.join('releases', metadata.Name));
    mkdirSync(path.join('releases', metadata.Name, 'files'));
    mkdirSync(path.join('releases', metadata.Name, 'res'));
}