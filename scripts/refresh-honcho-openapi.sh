#!/usr/bin/env bash
# Refreshes the pinned Honcho OpenAPI snapshot used for type generation.
#
# Usage:
#   ./scripts/refresh-honcho-openapi.sh https://honcho.example.com
#   ./scripts/refresh-honcho-openapi.sh ./local-honcho-openapi.json
#
# Operator runs this deliberately on Honcho upgrades. The generated types are
# committed; a CI check verifies types.ts matches openapi.json on each PR.

set -euo pipefail

SOURCE="${1:-}"
if [ -z "$SOURCE" ]; then
  echo "usage: $0 <honcho-url-or-local-path>"
  echo "example: $0 https://honcho.example.com"
  echo "example: $0 ./local-honcho-openapi.json"
  exit 1
fi

OUT="src/lib/honcho/openapi.json"

if [[ "$SOURCE" =~ ^https?:// ]]; then
  echo "fetching ${SOURCE}/openapi.json ..."
  curl -fsSL "${SOURCE%/}/openapi.json" -o "$OUT"
else
  echo "copying ${SOURCE} ..."
  cp "$SOURCE" "$OUT"
fi

echo "generating types ..."
bun run codegen

echo "done. review the diff:"
echo "  git diff $OUT src/lib/honcho/types.ts"
