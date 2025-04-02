import { writeFileSync } from 'node:fs';
import openEditor from 'open-editor';

export function openInEditor(content: any, path: string) {
    writeFileSync(JSON.stringify(content, undefined, '\t'), path);

    openEditor([{
        file: path
    }])
}