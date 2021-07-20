#!/usr/bin/env bash
# !!! Assuming Node14 and NPM are already installed! See instructions:
#       https://github.com/SpaceKatt/github-org-microservice#install-node14-using-nvm

# Install dependencies
sudo apt update
sudo apt install -y node-typescript
npm i -g eslint jest
npm i

# Lint
#npm run lin

# Test
#npm run test

# Build
npm run build

node build/src/index.js