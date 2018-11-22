import { CodeTransform } from '@atomist/sdm';
import { Project } from '@atomist/automation-client';

export function updateTitle(path: string, newTitle: string): CodeTransform {
    return async (p: Project) => {
        return { target: p, success: true, edited: false }
    }
}
