import { Cache, CacheType } from '../interfaces';
import { CacheFactory, CacheFactoryOpts } from '../factories';
import { getRequestWithRetry } from '../utils';

import { AxiosResponse } from 'axios';

export interface OrgInfo {
    name: string;
    numberOfRepos: number;
}

export interface OrgRepo {
    name: string;
}

export interface GitHubCachePayload {
    etag: string;
    // eslint-disable-next-line
    data: any;
}

export interface GitHubServiceOps {
    cacheType: CacheType;
}

export interface GitHubResponseWithCache {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    etag: string;
    usedCache: boolean;
}

export class GitHubService {
    static readonly apiHost = 'https://api.github.com';
    static readonly cacheName = 'github';
    static readonly defaultHeaders = {
        Accept: 'application/vnd.github.v3+json',
    };
    static readonly orgRoute = '/orgs';
    static readonly lastEtagKeyPrefix = 'LAST_ETAG_KEY';
    static readonly maxRepoPerPage = 100;
    static readonly maxRetryCount = 3;

    private cache: Cache;
    private repoLastEtag: { [org: string]: string };

    constructor(opts: GitHubServiceOps) {
        const cacheFactoryOpts: CacheFactoryOpts = {
            type: opts.cacheType,
            name: GitHubService.cacheName,
        };
        this.cache = CacheFactory.getInstance(cacheFactoryOpts);
        this.repoLastEtag = {};
    }

    private async getPathWithCache(
        path: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dataMap: (r: AxiosResponse) => any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        refreshCache = true,
    ): Promise<GitHubResponseWithCache> {
        const cachedData = (await this.cache.get(path)) as GitHubCachePayload;

        if (cachedData && !refreshCache) {
            return {
                data: cachedData.data,
                usedCache: true,
                etag: cachedData.etag,
            };
        }

        const cachedHeaders = cachedData
            ? { 'If-None-Match': cachedData.etag }
            : {};

        const response = await getRequestWithRetry(
            path,
            {
                ...cachedHeaders,
                ...GitHubService.defaultHeaders,
            },
            GitHubService.maxRetryCount,
        );

        // If undefined, then 304 indicates no update at service (use cached)
        if (!response) {
            return {
                data: cachedData.data,
                usedCache: true,
                etag: cachedData.etag,
            };
        }

        const mappedData = dataMap(response);

        // don't await cache set
        this.cache.set(path, {
            etag: response.headers.etag,
            data: mappedData,
        });

        return {
            data: mappedData,
            usedCache: false,
            etag: response.headers.etag,
        };
    }

    private getOrgPath(org: string): string {
        return `${GitHubService.apiHost}${GitHubService.orgRoute}/${org}`;
    }

    private async getOrgInfoCache(
        org: string,
    ): Promise<GitHubResponseWithCache> {
        const orgPath = this.getOrgPath(org);
        const mapOrgInfo = (resp: AxiosResponse): OrgInfo => {
            return {
                name: resp.data.name,
                numberOfRepos: resp.data.public_repos,
            };
        };

        return await this.getPathWithCache(orgPath, mapOrgInfo);
    }

    async getOrgInfo(org: string): Promise<OrgInfo> {
        const orgInfoCache = await this.getOrgInfoCache(org);
        return orgInfoCache.data;
    }

    private getOrgRepoPaths(org: string, orgInfo: OrgInfo): string[] {
        const numPages = Math.ceil(
            orgInfo.numberOfRepos / GitHubService.maxRepoPerPage,
        );

        const orgRepoPaths = [];

        for (let i = 1; i <= numPages; i++) {
            const prefix = `${GitHubService.apiHost}${GitHubService.orgRoute}/${org}`;
            const qs = `per_page=${GitHubService.maxRepoPerPage}&page=${i}&type=public`;
            orgRepoPaths.push(`${prefix}/repos?${qs}`);
        }

        return orgRepoPaths;
    }

    private getLastRepoRefreshKey(org: string): string {
        return `${GitHubService.lastEtagKeyPrefix}::${org}`;
    }

    private async getLastRepoRefreshEtag(
        org: string,
    ): Promise<string | undefined> {
        if (!this.repoLastEtag[org]) {
            const cachedEtag = await this.cache.get(
                this.getLastRepoRefreshKey(org),
            );
            this.repoLastEtag[org] = cachedEtag;
        }

        return this.repoLastEtag[org];
    }

    private async setLastRepoRefreshEtag(
        org: string,
        newEtag: string,
    ): Promise<void> {
        if (!this.repoLastEtag[org] || newEtag !== this.repoLastEtag[org]) {
            this.cache.set(this.getLastRepoRefreshKey(org), newEtag);
            this.repoLastEtag[org] = newEtag;
        }
    }

    async getOrgRepos(org: string): Promise<OrgRepo[]> {
        const orgInfoResponse = await this.getOrgInfoCache(org);
        const orgInfo = orgInfoResponse.data;

        const lastRefreshEtag = await this.getLastRepoRefreshEtag(org);
        const refreshCache = !lastRefreshEtag
            ? true
            : orgInfoResponse.etag !== lastRefreshEtag;

        if (refreshCache) {
            this.setLastRepoRefreshEtag(org, orgInfoResponse.etag);
        }

        // Takes a response from GitHub and transforms it to the shape we want
        const mapRepoData = (resp: AxiosResponse): OrgRepo => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return resp.data.map((x: any) => {
                return { name: x.name };
            });
        };

        // given a path string, make a request and return the data
        const processPath = async (path: string) => {
            const pathResponse = await this.getPathWithCache(
                path,
                mapRepoData,
                refreshCache,
            );
            return pathResponse.data;
        };

        // gather all paths
        const repoPaths = this.getOrgRepoPaths(org, orgInfo);
        // get the data for each path (and flatten resultant arrays into one)
        const orgRepos = await Promise.all(repoPaths.map(processPath));
        const flattenedOrgRepos: OrgRepo[] = orgRepos.reduce(
            (acc, x) => acc.concat(x),
            [],
        );
        // assert correctness of data, given org info
        if (flattenedOrgRepos.length != orgInfo.numberOfRepos) {
            console.error('Incorrect number of repos!');
        }
        return flattenedOrgRepos;
    }
}
