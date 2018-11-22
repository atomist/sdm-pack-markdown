import { RemarkFileParser } from './../remark/RemarkFileParser';
import { CodeTransform } from '@atomist/sdm';
import { Project } from '@atomist/automation-client';
import { findMatches } from '@atomist/automation-client/lib/tree/ast/astUtils';

export function updateTitle(path: string, newTitle: string): CodeTransform {
    return async (p: Project) => {
        const fileOfInterest = await p.getFile(path);
        if (!fileOfInterest) {
            return failedTransformResult(p, `File ${path} not found`);
        }

        const titleMatch = await findMatches(p, RemarkFileParser, path, "/root/heading/text")
        if (titleMatch.length < 1) {
            return failedTransformResult(p, `No title text found in ${path}`);
        }
        titleMatch[0].$value = newTitle;
        (p as any).flush();
        return { target: p, success: true, edited: true }
    }
}


function failedTransformResult(p: Project, message: string) {
    return {
        target: p,
        success: false,
        edited: false,
        error: new Error(message)
    }
}