import * as assert from "assert";
import { InMemoryProject } from "@atomist/automation-client";
import { updateTitle } from "../../lib/transform/updateTitle";
import { TransformResult } from "@atomist/sdm";

describe("Update Title transform", () => {
    it("Updates the title of a README", async () => {
        const input = InMemoryProject.of({
            path: "README.md",
            content: `# Hello There

and some stuff
`
        }, {
                path: "OTHER.md",
                content: `# Some other markdown

and its content`
            });
        const result = (await updateTitle("README.md", "New Title")(input, undefined)) as TransformResult
        assert(result.success, result.error);
        assert(result.edited, "Not edited");

        const newReadmeContent = await input.getFile("README.md").then(f => f.getContent());

        assert.strictEqual(newReadmeContent, `# New Title

and some stuff
`);
    });
});