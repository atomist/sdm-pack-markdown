/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as fs from "fs";
import * as path from "path";
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
