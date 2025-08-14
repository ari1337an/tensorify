#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
export NODE_ENV=development
export OFFLINE_PLUGINS_DIR="${OFFLINE_PLUGINS_DIR:-$ROOT_DIR/offline-plugins}"

echo "[0/2] Preparing dev token (backend at http://localhost:3001)..."
if curl -sSf "http://localhost:3001/health" >/dev/null 2>&1; then
  TOKEN=$(curl -s -X POST http://localhost:3001/api/test/auth \
    -H 'Content-Type: application/json' \
    -H 'x-test-environment: development' \
    -d '{"testId":"offline-build","username":"testing-bot-tensorify-dev","firstName":"Testing","lastName":"Bot"}' | jq -r .token || true)
  if [[ -n "$TOKEN" && "$TOKEN" != "null" ]]; then
    export TENSORIFY_TEST_TOKEN="$TOKEN"
    echo "Token acquired (${#TOKEN} chars)"
  else
    echo "WARN: Could not acquire test token; namespace may fall back to package scope"
  fi
else
  echo "WARN: Backend not reachable at http://localhost:3001; namespace may fall back to package scope"
fi

echo "[1/2] Building all offline plugins..."
shopt -s nullglob
for dir in "$OFFLINE_PLUGINS_DIR"/*; do
  [[ -d "$dir" ]] || continue
  if [[ -f "$dir/package.json" ]]; then
    echo "  • $dir"
    (cd "$dir" && pnpm install --silent | cat && pnpm run build | cat)
  fi
done

echo "[2/2] Regenerating offline artifacts (bundle + manifest)..."
for dir in "$OFFLINE_PLUGINS_DIR"/*; do
  [[ -d "$dir" ]] || continue
  if [[ -f "$dir/package.json" ]]; then
    echo "  • $dir"
    (cd "$dir" && node "$ROOT_DIR/packages/cli/lib/cli/src/bin/tensorify.js" publish --generate-offline --directory . | cat)
  fi
done

echo "✅ Offline build and regenerate complete"


