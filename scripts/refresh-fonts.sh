#!/usr/bin/env bash
# Refreshes the bundled IBM Plex Mono fonts from the @ibm/plex-mono npm package via jsDelivr.
#
# Usage: ./scripts/refresh-fonts.sh
#
# IBM Plex Mono is licensed under the SIL Open Font License v1.1, so vendoring is fine.
# The version comes from whatever jsDelivr serves at the unversioned package URL.

set -euo pipefail

OUT_DIR="static/fonts"
BASE="https://cdn.jsdelivr.net/npm/@ibm/plex-mono/fonts/complete/woff2"

mkdir -p "$OUT_DIR"

for face in Regular Bold; do
  echo "fetching IBMPlexMono-${face}.woff2 ..."
  curl -fsSL "${BASE}/IBMPlexMono-${face}.woff2" -o "${OUT_DIR}/IBMPlexMono-${face}.woff2"
done

echo "done. files:"
ls -lh "$OUT_DIR"/*.woff2
