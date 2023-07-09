#!/usr/bin/env sh

set -e
pnpm run build:core
cd packages/fy-core/dist

npm publish --access public
