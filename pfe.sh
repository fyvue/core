#!/bin/bash
dir=$(cd -P -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"/packages/playground/"
curl -X PATCH http://localhost:8080/_special/dev --data "{\"DevDir\": \"${dir}\"}"
