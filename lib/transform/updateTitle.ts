/*
 * Copyright © 2019 Atomist, Inc.
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

import { Project } from "@atomist/automation-client";
import { findMatches } from "@atomist/automation-client/lib/tree/ast/astUtils";
import {
    CodeTransform,
    TransformResult,
} from "@atomist/sdm";
import { RemarkFileParser } from "./../remark/RemarkFileParser";

/**
 * Get a code transform that updates the title of a markdown file to a fixed string
 */
export function updateTitleTransform(path: string, newTitle: string): CodeTransform {
    return async (p: Project) => {
        try {
            await updatePageTitle(p, path, newTitle);
        } catch (err) {
            return failedTransformResult(p, err);
        }
        return { target: p, success: true, edited: true };
    };
}

/**
 * Update the title of a markdown file within a project.
 * If the file does not exist
 * or cannot be parsed as markdown
 * or does not currently have a title, returns a rejected promise.
 */
export async function updatePageTitle(project: Project, path: string, newTitle: string): Promise<void> {
    const fileOfInterest = await project.getFile(path);
    if (!fileOfInterest) {
        throw new Error(`File ${path} not found`);
    }

    const titleMatch = await findMatches(project, RemarkFileParser, path, "/root/heading/text");
    if (titleMatch.length < 1) {
        throw new Error(`No title text found in ${path}`);
    }
    titleMatch[0].$value = newTitle;
    (project as any).flush();
}

/**
 * Deprecated: use updateTitleTransform for the transform,
 * or updatePageTitle within a transform of your own.
 */
export const updateTitle = updateTitleTransform;

function failedTransformResult(p: Project, error: Error): TransformResult {
    return {
        target: p,
        success: false,
        edited: false,
        error,
    };
}
