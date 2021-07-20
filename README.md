# GitHub Org Microservice

[![GH Org Microservice CI](https://github.com/SpaceKatt/github-org-microservice/actions/workflows/ci.yml/badge.svg)](https://github.com/SpaceKatt/github-org-microservice/actions/workflows/ci.yml)

Sample microservice to fetch, cache, and serve information about GitHub organizations and their public repos.

- [GitHub Org Microservice](#github-org-microservice)
  - [MVP Design Intent](#mvp-design-intent)
    - [Context](#context)
    - [Endpoint Definition](#endpoint-definition)
      - [Sample `curl` commands](#sample-curl-commands)
    - [Basic Data Flow](#basic-data-flow)
  - [Development](#development)
    - [Build Toolchain Setup](#build-toolchain-setup)
      - [Install `node14`, using `nvm`](#install-node14-using-nvm)
      - [Install `tsc` (and other Typescript support)](#install-tsc-and-other-typescript-support)
      - [Install `eslint` and `jest`](#install-eslint-and-jest)
    - [Install Dependencies](#install-dependencies)
    - [Build Project](#build-project)
    - [Test Project](#test-project)
    - [Lint Project](#lint-project)
  - [CI/CD](#cicd)
    - [Continuous Integration](#continuous-integration)
    - [Continuous Delivery](#continuous-delivery)
  - [Decision Log](#decision-log)

## MVP Design Intent

The `GitHub Org Microservice` is intended to be a proof-of-concept (PoC) for building a small service that caches public repository listings for an organization on GitHub.
[Fastify](https://www.fastify.io/) is used as the web framework for this PoC.

### Context

We wish to serve information about public repositories in a GitHub organization. Hopefully, we can do this at the lowest cost for ourselves and GitHub's API.

GitHub performs [rate limiting](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting) on its public APIs.
Luckily, ETags are provided to enable [conditional requests](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#conditional-requests) and enable cache use. Thus, we will use a cache to keep a local copy of API results.

Google is the target organization for this PoC, and its scale presents several considerations...

-   Repositories are updated often.
-   Repositories are added/removed frequently.
-   Repositories are numerous enough to require several pages from the paginated API.

Individual repositories are updated often, although their names are updated infrequently.
Thus, we assume that cached repository information will remain relevant until an organization's ETag changes (at which point the org's repo cache becomes stale).
This assumption will save us from making unnecessary requests to the API.

### Endpoint Definition

Two endpoints will be exposed by our microservice...

| Route                                | Description                              | Return Sample                                 |
| ------------------------------------ | ---------------------------------------- | --------------------------------------------- |
| `GET /v1/{org}/repositories`         | Get repository info for an organization. | `[{"name": "repo1"}, ..., {"name": "repoN"}]` |
| `PUT /v1/{org}/repositories/to_file` | Save repository info in `/tmp`           | `201 Created`                                 |

#### Sample `curl` commands

Assuming server is running on `127.0.0.1:8000` (i.e., the default if using `npm start`)...

```bash
# Get org public repos
curl 127.0.0.1:8080/v1/google/repositories

# Save org public repos to file on server
curl -v -X PUT 127.0.0.1:8080/v1/google/repositories/to_file
```

### Basic Data Flow

The following diagram depicts an abstract representation of how data flows through the system when a client makes a request to the `GET /v1/{org}/repositories` endpoint.

![Client request flow diagram](docs/diagrams/out/user-data-flow.png)

The `PUT /v1/{org}/repositories/to_file` endpoint has a very similar data flow. Instead of returning the repository list to the client, the server simply saves the data locally and returns `201 Created`. (The author will leave making a corresponding diagram as an exercise for the reader.)

## Development

This section describes how to set up a development environment for this project.
Setup is also [well documented in CI](https://github.com/SpaceKatt/github-org-microservice/actions/workflows/ci.yml).

> For Ease of use, a script is provided to run && build the project in a single command. (Requires `sudo`.)
>
> ```bash
> ./install-build-run.sh
> ```

### Build Toolchain Setup

This section describes how to set up the project's build toolchain.
`node14` was used in the development and testing of this project.
[`nvm`](https://github.com/nvm-sh/nvm) is recommended for devs who manage multiple versions of NodeJS.

#### Install `node14`, using `nvm`

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
source ~/.bashrc

# Install node14
nvm install 14
nvm use 14
```

#### Install `tsc` (and other Typescript support)

Transpilation of TypeScript into JavaScript require `tsc` to be installed.
Assuming the author is using Ubuntu (or has the `apt` package manager)...

```bash
sudo apt install install -y node-typescript
```

#### Install `eslint` and `jest`

Testing and linting this project requires `eslint` and `jest` to be installed globally.

```bash
npm i -g eslint jest
```

### Install Dependencies

Use `npm` to install project dependencies.

```bash
npm i
```

### Build Project

```bash
npm run build
```

### Test Project

```bash
npm run test
```

### Lint Project

```bash
npm run lint
```

## CI/CD

### Continuous Integration

Continuous integration is performed with [GitHub Actions](https://github.com/features/actions).
Process is defined by [the workflow manifest](./.github/workflows/ci.yml).
Results from pipeline runs may be [viewed on GitHub](https://github.com/SpaceKatt/github-org-microservice/actions/workflows/ci.yml).

### Continuous Delivery

Continuous delivery is not yet implemented, although it is on the roadmap.

## Decision Log

| Decision                                                     | Brief Description                                        |
| ------------------------------------------------------------ | -------------------------------------------------------- |
| [Fasitfy used as server framework](docs/adr/0001-fastify.md) | Fastify provides us with a lightweight web framework.    |
| [GitHub Actions for CI/CD](docs/adr/0002-github-actions.md)  | GitHub actions will be used for all CI/CD related tasks. |
