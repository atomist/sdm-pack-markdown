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

import { CodeTransform } from "@atomist/sdm";
import { contentFromWithinProject } from "./docChunk";

export interface MarkdownTransformOptions {

    /**
     * Path of Markdown file to transform
     */
    path: string;
}

// tslint:disable-next-line:no-empty-interface
export interface ContentProvider {
}

export interface LiteralContent extends ContentProvider {
    /**
     * String content
     */
    markdown: string;
}

function isLiteralContent(cp: ContentProvider): cp is LiteralContent {
    const maybe = cp as LiteralContent;
    return !!maybe.markdown;
}

export interface FromSource extends ContentProvider {
    /**
     * Source - path within project or content
     */
    source: string;
}

export type MarkdownAddContentOptions = ContentProvider & MarkdownTransformOptions & {

    /**
     * If this is true, create the file if it doesn't exist
     */
    createIfAbsent?: boolean,

} & (LiteralContent | FromSource);

/**
 * Append a snippet to the given Markdown document
 * @param {MarkdownAddContentOptions} opts
 * @return {CodeTransform}
 */
export function appendSnippet(opts: MarkdownAddContentOptions): CodeTransform {
    return async project => {
        const f = await project.getFile(opts.path);
        if (!f && !opts.createIfAbsent) {
            // Do nothing
            return { target: project, edited: false, success: true };
        }
        if (!!f) {
            await f.setContent(await f.getContent() + "\n\n" + await findContent(opts));
        } else {
            const content = await findContent(opts);
            console.log(content);
            await project.addFile(opts.path, content);
        }
        return { target: project, edited: true, success: true };
    };
}

async function findContent(opts: MarkdownAddContentOptions): Promise<string> {
    if (isLiteralContent(opts)) {
        return opts.markdown;
    }
    return contentFromWithinProject(opts.source);
}
