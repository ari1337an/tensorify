/* eslint-disable @typescript-eslint/no-require-imports */
const chokidar = require("chokidar");
const { exec } = require("child_process");

const watcher = chokidar.watch("src/app/api/v1/_contracts", {
  ignored: [
    "src/app/api/v1/_contracts/index.ts",
    "src/app/api/v1/_contracts/schema.ts",
    "src/app/api/v1/_contracts/test-utils.ts",
    "src/app/api/v1/_contracts/auth-utils.ts",
  ],
  ignoreInitial: true,
  awaitWriteFinish: true,
});

watcher.once("ready", () => {
  const watchedFiles = watcher.getWatched();
  if (Object.keys(watchedFiles).length === 0) {
    console.log("No files watched. Check your watch paths & ignored patterns.");
  } else {
    for (const [dir, files] of Object.entries(watchedFiles)) {
      files.forEach((file) => console.log(`${dir}/${file}`));
    }
  }
});

let timeout;
function runGenerate() {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    console.log("🛠️ Regenerating ts-rest index...");
    exec("pnpm run generate:tsrest", (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Error during generate:", err);
        return;
      }
      if (stderr) console.error(stderr);
      console.log(stdout);
    });
  }, 300);
}

watcher.on("add", runGenerate);
watcher.on("change", runGenerate);
watcher.on("unlink", runGenerate);

console.log("👀 Watching ts-rest contract/action files for changes...");
