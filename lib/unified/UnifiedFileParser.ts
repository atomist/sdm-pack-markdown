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
        const n = toUnifiedTreeNode(parsed);
        return this.enrich(n, parsed);
    }

    protected enrich(tn: TreeNode, from: UnifiedNode): TN {
        // Do nothing
        return tn as TN;
    }

}

export type UnifiedTreeNode = TreeNode

function toUnifiedTreeNode(unifiedNode: UnifiedNode): UnifiedTreeNode {
    return {
        $name: unifiedNode.type,
        $offset: !!unifiedNode.start ? unifiedNode.start.offset : 0,
        $children: unifiedNode.children ? unifiedNode.children.map(toUnifiedTreeNode) : undefined,
        $value: unifiedNode.value,
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
