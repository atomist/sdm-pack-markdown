import * as assert from "assert";

import * as jsverify from "jsverify";

type MinimalTree = {
    $children: MinimalTree[],
    depth: number,
}

const arbitraryDepth = jsverify.elements([1, 2, 3]);

const { arbitraryChildren, arbitraryTree } = (jsverify as any).letrec(tie => {
    return {
        arbitraryChildren: jsverify.small(jsverify.array(tie("arbitraryTree"))),
        arbitraryTree: jsverify.record({ depth: arbitraryDepth, $children: tie("arbitraryChildren") })
    }
})

describe("Re-nesting the tree", () => {
    jsverify.property("deeper things are nested under less deep things", arbitraryTree, tree => childrenDontGetDeeper(tree))
});

function childrenDontGetDeeper(tree: MinimalTree): boolean {
    return window(tree.$children).every(([a, b]) => {
        const laterOneIsDeeper = deeper(b, a);
        if (laterOneIsDeeper) {
            console.log("Problem: " + b.depth + " is deeper than " + a.depth);
        }
        return !laterOneIsDeeper;
    }) && tree.$children.every(childrenDontGetDeeper);
}

export function deeper(isThisNode: MinimalTree, deeperThanThis: MinimalTree): boolean {
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

function window<T>(arr: T[]): Array<[T, T]> {
    const output = [];
    for (var i = 0; i < arr.length - 1; i++) {
        output.push([arr[i], arr[i + 1]])
    }
    return output;
}