import axios, { AxiosError, AxiosResponse } from 'axios';

import { createWriteStream } from 'fs';
import * as pfs from 'fs/promises';
import { pipeline, Readable } from 'stream';
import { promisify } from 'util';
import { createGzip, unzip } from 'zlib';

export const utfToHex = (s: string): string => {
    return Buffer.from(s, 'utf-8').toString('hex');
};

export const hexToUtf = (s: string): string => {
    return Buffer.from(s, 'hex').toString('utf-8');
};

const pipe = promisify(pipeline);

/**
 * Compresses data and writes it to a file.
 *
 * @param data Data to compress and write
 * @param outPath path to write compressed data to
 */
export const writeCompressedFile = async (
    // eslint-disable-next-line
    data: any,
    outPath: string,
): Promise<void> => {
    const gzip = createGzip();
    const source = Readable.from(JSON.stringify(data));
    const sink = createWriteStream(outPath);
    await pipe(source, gzip, sink);
    await sink.close();
};

const do_unzip = promisify(unzip);

/**
 * Reads compressed data from a file.
 *
 * @param inPath path to read compressed data from
 * @returns uncompressed data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const readCompressedFile = async (inPath: string): Promise<any> => {
    await pfs.access(inPath);
    const fh = await pfs.open(inPath, 'r');
    const data = await fh.readFile();
    await fh.close();
    const result = await do_unzip(data);
    return JSON.parse(result.toString());
};

export const getRequest = async (
    path: string,
    // eslint-disable-next-line
    headers: any,
): Promise<AxiosResponse | undefined> => {
    const config = headers ? { headers: { ...headers } } : undefined;
    return await axios
        .get(path, config)
        .then((response: AxiosResponse) => {
            return response;
        })
        .catch((reason: AxiosError) => {
            // eslint-disable-next-line
            if (reason.response!.status === 304) {
                return undefined;
            }
            console.log(reason);

            throw new Error('No valid response from GET request');
        });
};

const DELAY_MS_BETWEEN_REQUESTS = 300;

export const delay = async (ms: number): Promise<string> => {
    return new Promise((resolve) => setTimeout(resolve, ms, ''));
};

export const getRequestWithRetry = async (
    path: string,
    // eslint-disable-next-line
    headers: any,
    retryCount: number,
): Promise<AxiosResponse | undefined> => {
    while (retryCount >= 0) {
        try {
            return await getRequest(path, headers);
        } catch {
            console.info(
                `Request "${path}" failed. Retrying ${retryCount} more times...`,
            );
            retryCount--;
            await delay(DELAY_MS_BETWEEN_REQUESTS);
        }
    }

    throw new Error(`Request "${path}" failed more than ${retryCount} times.`);
};
