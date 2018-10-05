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

import { TreeNode } from "@atomist/tree-path";
import {
    UnifiedFileParser,
    UnifiedNode,
    UnifiedTreeNode,
} from "../unified/UnifiedFileParser";

import { FileParser } from "@atomist/automation-client";
import * as markdown from "remark-parse";
import * as _ from "lodash";

class RemarkFileParserClass extends UnifiedFileParser<MarkdownTreeNode> {

    constructor() {
        super("markdown", markdown);
    }

    protected enrich(tn: TreeNode, from: UnifiedNode): MarkdownTreeNode {
        const mtn = enrichWithDepth(tn, from);
        moveStuffUnderHeadings(mtn);
        return mtn;
    }
}

function enrichWithDepth(tn: TreeNode, from: UnifiedNode): MarkdownTreeNode {
    const mtn = tn as MarkdownTreeNode;
    const raw = from as any;
    mtn.depth = raw.depth;
    if (tn.$children) {
        tn.$children = tn.$children.map((v, i) => enrichWithDepth(v, from.children[i]));
    }
    return mtn;
}

function moveStuffUnderHeadings(mtn: MarkdownTreeNode): void {
    if ((mtn.$children || []).length === 0) {
        // no children, nothing to do here
        return;
    }

    let childCount = mtn.$children.length;
    mtn.$children = processOneChild(mtn.$children, []);
    while (mtn.$children.length < childCount) {
        childCount = mtn.$children.length;
        mtn.$children = processOneChild(mtn.$children, []);
    }
}

/**
 * Call this multiple times
 * @param unprocessedChildren nodes
 * @param processedChildren nodes with adjacent deeper ones nested in
 */
function processOneChild(unprocessedChildren: MarkdownTreeNode[], processedChildren: MarkdownTreeNode[]): MarkdownTreeNode[] {

    const childOfInterest = unprocessedChildren.pop();
    if (unprocessedChildren.length === 0) {
        processedChildren.push(childOfInterest);
        return processedChildren;
    }

    const possibleParent = unprocessedChildren[1];

    if (deeper(childOfInterest, possibleParent)) {
        possibleParent.$children.push();
    } else {
        processedChildren.push(childOfInterest);
    }

    return processOneChild(unprocessedChildren, processedChildren);
}

export function deeper(isThisNode: MarkdownTreeNode, deeperThanThis: MarkdownTreeNode): boolean {
    if (isThisNode.depth === deeperThanThis.depth) {
        // same level
        return false;
    }
    if (isThisNode.depth === undefined) {
        // undefined goes under any heading
        return true;
    }
    // compare level of heading
    return isThisNode.depth > deeperThanThis.depth;
}

export const RemarkFileParser: FileParser<MarkdownTreeNode> = new RemarkFileParserClass();

export type MarkdownTreeNode = UnifiedTreeNode & {
    /**
     * Applies to headings
     */
    depth?: number;
};
