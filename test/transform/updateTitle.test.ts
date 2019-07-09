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

import { InMemoryProject } from "@atomist/automation-client";
import { TransformResult } from "@atomist/sdm";
import * as assert from "power-assert";
import { updateTitle } from "../../lib/transform/updateTitle";

describe("Update Title transform", () => {
    it("Updates the title of a README", async () => {
        const input = InMemoryProject.of({
            path: "README.md",
            content: `# Hello There

and some stuff
`,
        }, {
                path: "OTHER.md",
                content: `# Some other markdown

and its content`,
            });
        const result = (await updateTitle("README.md", "New Title")(input, undefined)) as TransformResult;
        assert(result.success, result.error as any);
        assert(result.edited, "Not edited");

        const newReadmeContent = await input.getFile("README.md").then(f => f.getContent());

        assert.strictEqual(newReadmeContent, `# New Title

and some stuff
`);
    });
});
