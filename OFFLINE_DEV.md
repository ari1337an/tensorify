## Offline plugins (dev)

- Set env

```bash
export NODE_ENV=development
export OFFLINE_PLUGINS_DIR="$(pwd)/offline-plugins"
```

- Generate artifacts (no auth, no upload)

```bash
cd offline-plugins/linear-layer-plugin
node ../../packages/cli/lib/src/bin/tensorify.js publish --generate-offline --directory .
```

- Start backend (reads from offline folder)

```bash
pnpm run dev --filter @tensorify.io/backend-api
```

- Optional: publish offline (sends webhook)

```bash
# (dev token)
TOKEN=$(curl -s -X POST http://localhost:3001/api/test/auth -H 'Content-Type: application/json' -H 'x-test-environment: development' -d '{"testId":"dev","username":"testing-bot-tensorify-dev","firstName":"Testing","lastName":"Bot"}' | jq -r .token)
export TENSORIFY_TEST_TOKEN="$TOKEN"

node ../../packages/cli/lib/src/bin/tensorify.js publish --offline --directory . --access public
```

- Test endpoints

```bash
# manifest
curl -s "http://localhost:3001/api/v1/plugin/getManifest?slug=@namespace/plugin:1.0.0" | jq .

# result
curl -s -X POST "http://localhost:3001/api/v1/plugin/getResult?slug=@namespace/plugin:1.0.0" \
  -H 'Content-Type: application/json' \
  -d '{"inFeatures":128,"outFeatures":64,"bias":true,"variableName":"linear1"}' | jq .
```

- Iterate

```bash
pnpm run build  # in your plugin
node ../../packages/cli/lib/src/bin/tensorify.js publish --generate-offline --directory .
```

## Scripts (root)

- offline:reset: clears app plugins (WorkflowInstalledPlugins), force-resets plugins DB, installs all offline plugins, offline-publishes all (backend at 3001 recommended)
- offline:build: reinstalls deps, rebuilds, regenerates bundle+manifest for all offline plugins (no upload)

```bash
# Reset data, reinstall, offline publish all plugins
pnpm offline:reset

# Rebuild and regenerate bundles/manifests for all offline plugins
pnpm offline:build
```
