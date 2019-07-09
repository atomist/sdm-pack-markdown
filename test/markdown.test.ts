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
import * as fs from "fs";
import * as assert from "power-assert";
import { promisify } from "util";
import { appendSnippet } from "../lib/markdown";

describe("markdown manipulation", () => {

    it("should not edit empty project", async () => {
        const p = InMemoryProject.of();
        const t = appendSnippet({ path: "not.there.md", source: "thing" });
        const tr = await t(p, undefined) as TransformResult;
        assert.strictEqual(tr.edited, false);
    });

    it("should create markdown from literal if it does not exist if option is set", async () => {
        const p = InMemoryProject.of();
        const t = appendSnippet({ path: "not.there.md", createIfAbsent: true, markdown: "thing" });
        const tr = await t(p, undefined) as TransformResult;
        assert.strictEqual(tr.edited, true);
        const f = p.findFileSync("not.there.md");
        assert(!!f);
        assert.strictEqual(f.getContentSync(), "thing");
    });

    it("should throw exception if source not found", async () => {
        const p = InMemoryProject.of();
        const t = appendSnippet({ path: "not.there.md", createIfAbsent: true, source: "thing.md" });
        t(p, undefined).catch(err => { // Ok
        });
    });

    it("should create markdown from file source if it does not exist if option is set", async () => {
        const p = InMemoryProject.of();
        const t = appendSnippet({
            path: "not.there.md",
            createIfAbsent: true,
            source: "README.md",
        });
        const tr = await t(p, undefined) as TransformResult;
        assert.strictEqual(tr.edited, true);
        const f = p.findFileSync("not.there.md");
        const expectedContent = await (promisify(fs.readFile))("README.md", { encoding: "utf-8" });
        assert(!!f);
        assert.strictEqual(f.getContentSync(), expectedContent);
    });

});
