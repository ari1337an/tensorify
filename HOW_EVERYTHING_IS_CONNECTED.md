plugins are enforced with types and classess abstractions using the sdk at "./packages/sdk"

plugins are uploaded to the s3 and added its informations in the plugins.tensorify.io's (./services/plugins.tensorify.io) database.

when a developer would create a plugin using the create-tensorify-plugin's ('./packages/create-tensorify-plugin')'s templates and make changes according to his need but still following the sdk types and class rules. then he can publish it using the cli tool at "./packages/cli".

the cli, create-tensorify-plugin, and sdk are the main dev tools.
They are one command patch version up-able by the commands from the root directory package.json ( "version:patch": "sh scripts/version-management.sh patch",
    "version:minor": "sh scripts/version-management.sh minor",
    "version:major": "sh scripts/version-management.sh major",
    "publish:all": "sh scripts/version-management.sh publish" )

these devtools versions needs to be synced at all times.
version(cli) == version(sdk) == version(create-tensorify-plugin)

If a user publishes the plugin the data flows like:
- users machine uploads to backend api
- backend api (./services/api) : uploads to s3 and sends success web hook to plugins.tensorify.io (./services/plugins.tensorify.io)
- plugins.tensorify.io then saves the informations in the database

So, if any enforcement or data is changed make sure to check this manually and make sure nothing is breaking.


How the transpiler is designed is in ./TRANSPILER_DESIGN.md file

The whole react flow related things are in "./services/app.tensorify.io/src/app/(application)/(protected)/(canvas)/_workflow"

There are three zustand stores in app.tensorify.io:
- services/app.tensorify.io/src/app/_store/store.ts
- services/app.tensorify.io/src/app/(application)/(protected)/(canvas)/_workflow/store/workflowStore.ts
- react flows internal zustand store.

React flows all official offline documentations are in ./reactflow-documentation

The API Endpoints are created with TS-REST and they are in ./services/api and ./services/app.tensorify.io are in
- services/api/src/v1
- services/app.tensorify.io/src/app/api/v1/_contracts

For developing the app.tensorify.io TS-REST and running tests commands are in .cursor/rules/app-tensorify-api-creation-testing-using.mdc file
