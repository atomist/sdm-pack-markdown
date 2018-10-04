import { FileParser } from "@atomist/automation-client";
import { ProjectFile } from "@atomist/sdm";
import { TreeNode } from "@atomist/tree-path";

import * as unified from "unified";

export abstract class UnifiedFileParser<TN extends TreeNode> implements FileParser<TN> {

    // TODO type the parser
    protected constructor(public readonly rootName: string,
                          private readonly parser: any) {
    }

    public async toAst(f: ProjectFile): Promise<TN> {
        const parser = unified()
            .use(this.parser);

        const content = await f.getContent();
        const parsed = parser.parse(content);
        console.log(JSON.stringify(parsed));
        const n = new UnifiedTreeNode(parsed);
        return this.enrich(n, parsed);
    }

    protected enrich(tn: TreeNode, from: UnifiedNode): TN {
        // Do nothing
        return tn as TN;
    }

}

class UnifiedTreeNode implements TreeNode {

    get $children(): TreeNode[] {
        return this.unifiedNode.children.map(c => new UnifiedTreeNode(c, this));
    }

    public readonly $name: string = this.unifiedNode.type;

    public readonly $offset: number = !!this.unifiedNode.start ? this.unifiedNode.start.offset : -1;

    public $value: string = this.unifiedNode.value;

    constructor(private readonly unifiedNode: UnifiedNode,
                public readonly parent?: TreeNode) {
    }
}

/**
 * Node returned by Unified
 */
export interface UnifiedNode {

    type: string;

    start: { offset: number };

    children: UnifiedNode[];

    value: string;

}
