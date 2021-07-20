import { CacheType } from './interfaces';
import { GitHubService, GitHubServiceOps } from './services';

import * as fastify from 'fastify';

const gitHubServiceOpts: GitHubServiceOps = {
    cacheType: CacheType.FILE,
};

const server = fastify.fastify();
const ghService = new GitHubService(gitHubServiceOpts);

const API_VERSION = '/v1';
const SERVER_PORT = 8080;

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
        }

        reply
            .code(200)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send(orgRepos);
    },
);

server.listen(SERVER_PORT, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
