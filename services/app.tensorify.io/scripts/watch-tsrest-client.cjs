/* eslint-disable @typescript-eslint/no-require-imports */
const chokidar = require("chokidar");
const { exec } = require("child_process");

// Watch the same contract directory, as changes there should trigger client regeneration
const watcher = chokidar.watch("src/app/api/v1/_contracts", {
  ignored: [
    "src/app/api/v1/_contracts/index.ts",
    "src/app/api/v1/_contracts/schema.ts",
    "src/app/api/v1/_contracts/test-utils.ts",
    "src/app/api/v1/_contracts/auth-utils.ts",
    /(^|[\\\/])\\.[^\\\/\\.]/g, // Ignore dotfiles/folders
    "**/*.test.ts", // Ignore test files
  ],
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 500,
    pollInterval: 100,
  },
});

watcher.once("ready", () => {
  const watchedFiles = watcher.getWatched();
  if (Object.keys(watchedFiles).length === 0) {
    console.log(
      "No files watched for client generation. Check your watch paths & ignored patterns."
    );
  } else {
    console.log("Initial scan complete. Ready for changes to generate client.");
    // Optional: Log watched files for debugging
    // for (const [dir, files] of Object.entries(watchedFiles)) {
    //   files.forEach(file => console.log(`Watching: ${dir}/${file}`));
    // }
  }
});

let timeout;
function runGenerateClient() {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    console.log("🛠️ Regenerating ts-rest client...");
    exec("pnpm run generate:tsrest:client", (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Error during client generation:", err);
        return;
      }
      if (stderr) console.error("stderr: ", stderr);
      console.log(stdout);
    });
  }, 300);
}

watcher.on("add", runGenerateClient);
watcher.on("change", runGenerateClient);
watcher.on("unlink", runGenerateClient);

console.log("👀 Watching ts-rest contract files for client generation...");
