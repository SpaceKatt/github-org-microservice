import { CacheType } from './interfaces';
import { GitHubService, GitHubServiceOps } from './services';
import { writeCompressedFile } from './utils';

import * as fastify from 'fastify';

const API_VERSION = '/v1';
const SERVER_PORT = 8080;
const SERVER_HOST = '127.0.0.1';
const TMP_FILE_PATH = '/tmp/knock_interview.json.gz';

const gitHubServiceOpts: GitHubServiceOps = {
    cacheType: CacheType.FILE,
};
const ghService = new GitHubService(gitHubServiceOpts);

const server = fastify.fastify();

interface OrgParams {
    org: string;
}

server.get<{ Params: OrgParams }>(
    `${API_VERSION}/:org/repositories`,
    {},
    async (request, reply) => {
        const org = request.params.org;

        if (org !== 'google') {
            reply
                .code(400)
                .send(
                    `Unable to fetch info for org "${org}". Only "google" is supported.\n`,
                );
            return;
        }

        let orgRepos;
        try {
            orgRepos = await ghService.getOrgRepos(org);
        } catch {
            reply.code(500).send('Internal error => LOL\n');
            return;
        }

        reply
            .code(200)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send(orgRepos);
    },
);

server.put<{ Params: OrgParams }>(
    `${API_VERSION}/:org/repositories/to_file`,
    {},
    async (request, reply) => {
        const org = request.params.org;

        // TODO: validation middleware, to be DRY
        if (org !== 'google') {
            reply
                .code(400)
                .send(
                    `Unable to fetch info for org "${org}". Only "google" is supported.\n`,
                );
            return;
        }

        let orgRepos;
        try {
            orgRepos = await ghService.getOrgRepos(org);
            await writeCompressedFile(orgRepos, TMP_FILE_PATH);
        } catch {
            reply.code(500).send('Internal error => LOL\n');
            return;
        }

        reply.code(201).send();
    },
);

server.listen(SERVER_PORT, SERVER_HOST, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
