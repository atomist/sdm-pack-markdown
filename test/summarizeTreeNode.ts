import { TreeNode } from "@atomist/tree-path";
import * as assert from "assert";

export type NodeSummary = { name: string, summarizeError: string } |
{
    name: string,
    children?: Array<NodeSummary>,
    value?: string,
    offset: number,
    length?: number,
    depth?: number,
}

export function summarizeNode(tn: TreeNode) {
    try {
        return {
            children: tn.$children ? tn.$children.map(summarizeNode) : undefined,
            name: tn.$name,
            value: tn.$children ? undefined : tn.$value,
            offset: tn.$offset,
            length: tn.$value ? tn.$value.length : undefined,
            depth: (tn as any).depth,
        }
    } catch (err) {
        return {
            name: tn.$name,
            summarizeError: err.message,
        }
    }
}

export function assertPartialEquals(actual: NodeSummary, expected: Partial<NodeSummary>, path: string[] = []) {
    Object.entries(expected).forEach(([key, expectedValue]) => {
        console.log("key is " + key);
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