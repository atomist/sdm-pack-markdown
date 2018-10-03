import { InMemoryProject, TransformResult } from "@atomist/sdm";
import { appendSnippet } from "../lib/markdown";

import * as assert from "assert";

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
        const t = appendSnippet({ path: "not.there.md", createIfAbsent: true, source: "README.md" });
        const tr = await t(p, undefined) as TransformResult;
        assert.strictEqual(tr.edited, true);
        const f = p.findFileSync("not.there.md");
        assert(!!f);
        assert.strictEqual(f.getContentSync(), "thing");
    });

});
