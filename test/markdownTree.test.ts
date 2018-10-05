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

import { InMemoryProjectFile } from "@atomist/sdm";
import { RemarkFileParser } from "../lib/remark/RemarkFileParser";

import * as assert from "assert";
import {
    assertPartialEquals,
    summarizeNode,
} from "./summarizeTreeNode";

describe("parser", () => {

    it("should create tree", async () => {
        const f = new InMemoryProjectFile("README.md", "# Heading 1");
        const ast = await RemarkFileParser.toAst(f);
        assert(!!ast);
        assert.strictEqual(ast.$name, "root");
    });

    it("should find heading", async () => {
        const f = new InMemoryProjectFile("README.md", "# Heading 1\n## Heading 2\nThis is text");
        const ast = await RemarkFileParser.toAst(f);
        assert(!!ast);
        const summary = summarizeNode(ast);
        // console.log(JSON.stringify(summary, undefined, 2));
        assertPartialEquals(summary, {
            name: "root",
            children: [
                {
                    name: "heading", offset: 0, depth: 1,
                    children: [{ name: "text", value: "Heading 1", offset: 2 }],
                },
                { name: "heading", depth: 2 },
                { name: "paragraph" }],
        });
    });
});
