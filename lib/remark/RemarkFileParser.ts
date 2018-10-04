import { UnifiedFileParser, UnifiedNode } from "../unified/UnifiedFileParser";
import { TreeNode } from "@atomist/tree-path";

const markdown = require("remark-parse");

export class RemarkFileParser extends UnifiedFileParser<MarkdownTreeNode> {

    constructor() {
        super("markdown", markdown);
    }

    protected enrich(tn: TreeNode, from: UnifiedNode): MarkdownTreeNode {
        const mtn = tn as MarkdownTreeNode;
        const raw = from as any;
        mtn.depth = raw.depth;
        return mtn;
    }
}

export interface MarkdownTreeNode extends TreeNode {

    /**
     * Applies to headings
     */
    depth?: number;
}
