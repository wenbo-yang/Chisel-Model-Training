import fs from 'fs/promises';
import * as fsSync from 'fs';
import path from 'path';

export async function deleteAllFilesInFolder(folderPath: string): Promise<void> {
    if (!fsSync.existsSync(folderPath)) {
        return;
    }

    const files = await fs.readdir(folderPath);

    for (let file of files) {
        await fs.rm(path.join(folderPath, file));
    }
}
