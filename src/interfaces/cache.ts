export enum CacheType {
    FILE = 'FILE',
    REDIS = 'REDIS',
}

export interface Cache {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(key: string): Promise<any | undefined>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set(key: string, data: any): Promise<void>;
    flush(): void;
}
