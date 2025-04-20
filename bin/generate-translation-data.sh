#! /bin/bash

echo "Generating translation data in: $(pwd)"
echo ""

DATA_JSON_PATH="$(dirname "$(realpath "$0")")"/../src/data.json

echo "Will output to: $DATA_JSON_PATH"

deno run -A https://jsr.io/@axhxrx/internationalization-format-converter/0.0.9/mod.ts  batch-export . "$DATA_JSON_PATH"