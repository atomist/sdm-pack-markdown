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

import * as _ from "lodash";
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
        // console.log(JSON.stringify(parsed));
        const n = toUnifiedTreeNode(parsed, content);
        return this.enrich(n, parsed);
    }

    protected enrich(tn: TreeNode, from: UnifiedNode): TN {
        // Do nothing
        return tn as TN;
    }

}

export type UnifiedTreeNode = TreeNode;

function toUnifiedTreeNode(unifiedNode: UnifiedNode, fullContent: string): UnifiedTreeNode {
    const startOffset = unifiedNode.position.start.offset;
    let value = unifiedNode.value;
    if (!value) {
        const endOffset = unifiedNode.position.end.offset;
        value = fullContent.slice(startOffset, endOffset);
    }

    const unifiedTreeNode = {
        $name: unifiedNode.type,
        $offset: startOffset,
        $children: unifiedNode.children ? unifiedNode.children.map(n => toUnifiedTreeNode(n, fullContent)) : [],
        $value: value,
    };
    unifiedTreeNode.$children.forEach(c => c.$parent = unifiedTreeNode);
    return unifiedTreeNode;
}

/**
 * Node returned by Unified
 */
export interface UnifiedNode {

    type: string;

    position: { start: { offset: number }, end: { offset: number } };

    children: UnifiedNode[];

    value: string;

}
