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
import { UnifiedFileParser, UnifiedNode } from "../unified/UnifiedFileParser";

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
