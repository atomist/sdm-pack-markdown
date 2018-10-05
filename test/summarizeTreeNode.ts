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
import * as assert from "assert";

export type NodeSummary = { name: string, summarizeError: string } |
{
    name: string,
    children?: NodeSummary[],
    value?: string,
    offset: number,
    length?: number,
    depth?: number,
};

export function summarizeNode(tn: TreeNode): NodeSummary {
    try {
        return {
            children: tn.$children ? tn.$children.map(summarizeNode) : undefined,
            name: tn.$name,
            value: tn.$value,
            offset: tn.$offset,
            length: tn.$value ? tn.$value.length : undefined,
            depth: (tn as any).depth,
        };
    } catch (err) {
        return {
            name: tn.$name,
            summarizeError: err.message,
        };
    }
}

export function assertPartialEquals(actual: NodeSummary,
                                    expected: Partial<NodeSummary>, path: string[] = []): void {
    Object.entries(expected).forEach(([key, expectedValue]) => {
        const actualValue = actual[key];
        if (Array.isArray(expectedValue)) {
            // only check for the listed ones. extra is fine
            expectedValue.forEach((v, i) => assertPartialEquals(actualValue[i], v, [...path, key + "[" + i + "]"]));
        } else {
            assert.strictEqual(actualValue, expectedValue,
                `${[...path, key].join(".")} was [${actualValue}], expected [${expectedValue}]`);
        }
    });
}
