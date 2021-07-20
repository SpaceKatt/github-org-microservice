import { Cache, CacheType } from '../interfaces';
import { FileCache } from '../cache';

export interface CacheFactoryOpts {
    type: CacheType;
    name: string;
}

export class CacheFactory {
    static getInstance(opts: CacheFactoryOpts): Cache {
        switch (opts.type) {
            case CacheType.FILE:
                return new FileCache(opts.name);
            case CacheType.REDIS:
                throw new Error('Redis cache not implemented.');
        }
    }
}
