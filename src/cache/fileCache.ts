import { Cache } from '../interfaces';
import { readCompressedFile, utfToHex, writeCompressedFile } from '../utils';

import * as fs from 'fs';
import * as path from 'path';

export class FileCache implements Cache {
    static cachePathPrefix = 'node_modules/.cache';

    private cachePath: string;

    constructor(name: string) {
        this.cachePath = path.join(FileCache.cachePathPrefix, name);

        if (!fs.existsSync(FileCache.cachePathPrefix)) {
            fs.mkdirSync(FileCache.cachePathPrefix);
        }
        if (!fs.existsSync(this.cachePath)) {
            fs.mkdirSync(this.cachePath);
        }
    }

    private getCachePath(key: string): string {
        const encodedKey = `${utfToHex(key)}.json.gz`;
        return path.join(this.cachePath, encodedKey);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async get(key: string): Promise<any | undefined> {
        const keyPath = this.getCachePath(key);
        try {
            const data = await readCompressedFile(keyPath);
            return data;
        } catch {
            return undefined;
        }
    }

    // eslint-disable-next-line
    async set(key: string, data: any): Promise<void> {
        const keyPath = this.getCachePath(key);
        await writeCompressedFile(data, keyPath);
    }

    flush(): void {
        fs.rmdirSync(this.cachePath, { recursive: true });
        fs.mkdirSync(this.cachePath);
    }
}
