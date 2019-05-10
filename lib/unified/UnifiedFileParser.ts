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

import {
    FileParser,
    ProjectFile,
} from "@atomist/automation-client";
import { TreeNode } from "@atomist/tree-path";

import * as _ from "lodash";
import * as unified from "unified";
export abstract class UnifiedFileParser<TN extends UnifiedTreeNode> implements FileParser<TN> {

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
        const n = toUnifiedTreeNode(parsed as UnifiedNode, this.enrich);
        const enriched = this.enrich(n, parsed as UnifiedNode);
        eatYourSiblings(enriched, this.shouldBeNested);
        adjustOffsets(enriched);
        populateValues(enriched, content);
        attachParents(enriched);
        return enriched;
    }

    protected enrich(tn: TreeNode, from: UnifiedNode): TN {
        // Do nothing
        return tn as TN;
    }

    protected shouldBeNested(shouldThisOne: TN, beNestedUnder: TN): boolean {
        return false;
    }

}

export type UnifiedTreeNode = TreeNode & { $endOffset: number };

function toUnifiedTreeNode<TN extends UnifiedTreeNode>(unifiedNode: UnifiedNode,
                                                       enrich: (utn: UnifiedTreeNode, from: UnifiedNode) => TN): TN {
    const startOffset = unifiedNode.position.start.offset;
    const endOffset = unifiedNode.position.end.offset;

    const unifiedTreeNode = {
        $name: unifiedNode.type,
        $offset: startOffset,
        $children: unifiedNode.children ? unifiedNode.children.map(n => toUnifiedTreeNode(n, enrich)) : [],
        $endOffset: endOffset,
    };
    const enriched = enrich(unifiedTreeNode, unifiedNode);
    return enriched;
}

function adjustOffsets(utn: UnifiedTreeNode): void {
    utn.$children.forEach(adjustOffsets);
    utn.$endOffset = Math.max(utn.$endOffset, ...utn.$children.map(c => (c as UnifiedTreeNode).$endOffset));
}

function populateValues(utn: UnifiedTreeNode, fullContent: string): void {
    utn.$value = fullContent.slice(utn.$offset, utn.$endOffset);
    utn.$children.forEach(c => populateValues(c as UnifiedTreeNode, fullContent));
}

function attachParents(tree: TreeNode): void {
    tree.$children.forEach(c => c.$parent = tree);
    tree.$children.forEach(attachParents);
}

// mutates the tree
export function eatYourSiblings<T extends TreeNode>(
    tree: T,
    shouldBeNested: (shouldThisOne: T, beNestedUnder: T) => boolean): void {

    let i = 0;
    const ammendedChildren = [];
    while (i < tree.$children.length) {
        const hungryChild = tree.$children[i];
        const edibleSiblings = _.takeWhile(tree.$children.slice(i + 1),
            sib => shouldBeNested(sib as T, hungryChild as T));
        edibleSiblings.forEach(sib => hungryChild.$children.push(sib)); // might be none
        ammendedChildren.push(hungryChild);
        i = i + 1 + edibleSiblings.length;
    }

    tree.$children = ammendedChildren;

    tree.$children.forEach(c => eatYourSiblings(c as T, shouldBeNested));
}

/**
 * Node returned by Unified
 */
// tslint:disable-next-line:no-implicit-dependencies
import * as Unist from "unist";
export interface UnifiedNode extends Unist.Parent {

    type: string;

    //  position: { start: { offset: number, line: number, column: number }, end: { offset: number } };

    children: UnifiedNode[];

    value: string;

}
