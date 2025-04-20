#! /bin/bash

echo ""

REVISION_JSON_PATH="$(dirname "$(realpath "$0")")"/../src/revision.json
echo "Writing revision data to: $REVISION_JSON_PATH"

DENO_SCRIPT_PATH="$(dirname "$(realpath "$0")")"/generate-revision-json.deno.ts


deno run -A "$DENO_SCRIPT_PATH"