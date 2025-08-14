#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
export NODE_ENV=development
export OFFLINE_PLUGINS_DIR="${OFFLINE_PLUGINS_DIR:-$ROOT_DIR/offline-plugins}"

echo "[1/5] Clearing app.tensorify.io WorkflowInstalledPlugins..."
(
  cd "$ROOT_DIR/services/app.tensorify.io"
  # Delete only WorkflowInstalledPlugins rows (no full reset)
  printf 'DELETE FROM "WorkflowInstalledPlugins";' | npx prisma db execute --schema src/server/database/prisma/schema.prisma --stdin | cat
)

echo "[2/5] Resetting plugins.tensorify.io database (full reset)..."
(
  cd "$ROOT_DIR/services/plugins.tensorify.io"
  npx prisma db push --force-reset | cat
)

echo "[3/5] Preparing dev token (backend at http://localhost:3001)..."
TOKEN=""
if curl -sSf "http://localhost:3001/health" >/dev/null 2>&1; then
  TOKEN=$(curl -s -X POST http://localhost:3001/api/test/auth \
    -H 'Content-Type: application/json' \
    -H 'x-test-environment: development' \
    -d '{"testId":"offline-dev","username":"testing-bot-tensorify-dev","firstName":"Testing","lastName":"Bot"}' | jq -r .token || true)
  if [[ -n "$TOKEN" && "$TOKEN" != "null" ]]; then
    export TENSORIFY_TEST_TOKEN="$TOKEN"
    echo "Token acquired (${#TOKEN} chars)"
  else
    echo "WARN: Could not acquire test token; offline publish webhook may be skipped"
  fi
else
  echo "WARN: Backend not reachable at http://localhost:3001; skipping token"
fi

echo "[4/5] Installing offline plugin deps..."
shopt -s nullglob
for dir in "$OFFLINE_PLUGINS_DIR"/*; do
  [[ -d "$dir" ]] || continue
  if [[ -f "$dir/package.json" ]]; then
    echo "  • $dir"
    (cd "$dir" && npm install --silent | cat)
  fi
done

echo "[5/5] Offline publishing all plugins..."
for dir in "$OFFLINE_PLUGINS_DIR"/*; do
  [[ -d "$dir" ]] || continue
  if [[ -f "$dir/package.json" ]]; then
    echo "  • $dir"
    (cd "$dir" && node "$ROOT_DIR/packages/cli/lib/cli/src/bin/tensorify.js" publish --offline --directory . --access public | cat) || true
  fi
done

echo "✅ Offline reset and publish complete"


