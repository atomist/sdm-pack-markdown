import * as path from "path";
import * as fs from "fs";
import { promisify } from "util";

/**
 * Dynamically build an advice block from a documentation chunk within this project,
 * relative to the root
 * @param {string} pathUnderRoot path relative to the base of the current project
 */
export async function contentFromWithinProject(pathUnderRoot: string): Promise<string> {
    // Back up from /lib to root
    const location = path.join(__dirname, "..", pathUnderRoot);
    return loadContent(location);
}

async function loadContent(location: string): Promise<string> {
    const buf = await promisify(fs.readFile)(location);
    return buf.toString();

}
