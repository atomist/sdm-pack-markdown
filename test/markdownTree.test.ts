import { InMemoryProjectFile } from "@atomist/sdm";
import { RemarkFileParser } from "../lib/remark/RemarkFileParser";

import * as assert from "assert";

describe("parser", () => {

    it("should create tree", async () => {
        const f = new InMemoryProjectFile("README.md", "# Heading 1");
        const ast = await new RemarkFileParser().toAst(f);
        assert(!!ast);
        assert.strictEqual(ast.$name, "root");
    });

    it("should find heading", async () => {
        const f = new InMemoryProjectFile("README.md", "# Heading 1\n## Heading 2\nThis is text");
        const ast = await new RemarkFileParser().toAst(f);
        assert(!!ast);
        assert.strictEqual(ast.$children[0].$name, "heading");
        assert.strictEqual(ast.$children[1].$name, "heading");
        assert.strictEqual(ast.$children[2].$name, "paragraph");
    });
});
