import * as assert from "assert";

import * as jsverify from "jsverify";
import { TreeNode } from "@atomist/tree-path";
import { eatYourSiblings } from "../lib/unified/UnifiedFileParser";

type MinimalTree = {
    depth: number,
} & TreeNode

const arbitraryDepth = jsverify.elements([1, 2, 3]);

const { arbitraryChildren, arbitraryTree } = (jsverify as any).letrec(tie => {
    return {
        arbitraryChildren: jsverify.small(jsverify.array(tie("arbitraryTree"))),
        arbitraryTree: jsverify.record({ depth: arbitraryDepth, $children: tie("arbitraryChildren") })
    }
})

describe("Re-nesting the tree", () => {
    jsverify.property("deeper things are nested under less deep things", arbitraryTree, tree => {
        eatYourSiblings(tree, deeper);
        return childrenDontGetDeeper(tree);
    })
});


function childrenDontGetDeeper(tree: MinimalTree): boolean {
    return window(tree.$children).every(([a, b]) => {
        const laterOneIsDeeper = deeper(b as MinimalTree, a as MinimalTree);
        if (laterOneIsDeeper) {
            console.log("Problem: " + (b as MinimalTree).depth + " is deeper than " + (a as MinimalTree).depth);
        }
        return !laterOneIsDeeper;
    }) && tree.$children.every(childrenDontGetDeeper);
}

export function deeper(isThisNode: MinimalTree, deeperThanThis: MinimalTree): boolean {
    return isThisNode.depth > deeperThanThis.depth;
}

function window<T>(arr: T[]): Array<[T, T]> {
    const output = [];
    for (var i = 0; i < arr.length - 1; i++) {
        output.push([arr[i], arr[i + 1]])
    }
    return output;
}