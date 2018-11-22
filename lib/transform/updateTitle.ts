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

import { Project } from "@atomist/automation-client";
import { findMatches } from "@atomist/automation-client/lib/tree/ast/astUtils";
import { CodeTransform, TransformResult } from "@atomist/sdm";
import { RemarkFileParser } from "./../remark/RemarkFileParser";

export function updateTitle(path: string, newTitle: string): CodeTransform {
    return async (p: Project) => {
        const fileOfInterest = await p.getFile(path);
        if (!fileOfInterest) {
            return failedTransformResult(p, `File ${path} not found`);
        }

        const titleMatch = await findMatches(p, RemarkFileParser, path, "/root/heading/text");
        if (titleMatch.length < 1) {
            return failedTransformResult(p, `No title text found in ${path}`);
        }
        titleMatch[0].$value = newTitle;
        (p as any).flush();
        return { target: p, success: true, edited: true };
    };
}

function failedTransformResult(p: Project, message: string): TransformResult {
    return {
        target: p,
        success: false,
        edited: false,
        error: new Error(message),
    };
}
