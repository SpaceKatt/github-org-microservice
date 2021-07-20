# GitHub Org Microservice

Sample microservice to fetch, cache, and serve information about GitHub organizations and their public repos.

- [GitHub Org Microservice](#github-org-microservice)
  - [Decision Log](#decision-log)

## Decision Log

| Decision                                                     | Brief Description                                        |
| ------------------------------------------------------------ | -------------------------------------------------------- |
| [Fasitfy used as server framework](docs/adr/0001-fastify.md) | Fastify provides us with a lightweight web framework.    |
| [GitHub Actions for CI/CD](docs/adr/0002-github-actions.md)  | GitHub actions will be used for all CI/CD related tasks. |
