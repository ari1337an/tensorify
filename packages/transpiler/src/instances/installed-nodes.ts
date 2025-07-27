import fs from "fs";
import path from "path";
import { TensorifyPlugin } from "@tensorify.io/sdk";

// The directory where your node modules are located
const nodesDir = path.join(__dirname, "../nodes");

// Object to store the dynamically imported nodes
const InstalledNodes: { [key: string]: new () => TensorifyPlugin } = {};

// Read all files in the nodes directory
fs.readdirSync(nodesDir).forEach((file) => {
  // Define possible file paths for both .ts and .js
  const tsPath = path.join(nodesDir, file, "index.ts");
  const jsPath = path.join(nodesDir, file, "index.js");

  let nodePath = "";
  if (fs.existsSync(tsPath)) {
    nodePath = tsPath;
  } else if (fs.existsSync(jsPath)) {
    nodePath = jsPath;
  }

  // If no valid path found, skip this file
  if (!nodePath) return;

  // Import the module dynamically
  const nodeModule = require(nodePath);

  // Get the class from the module (assuming default export)
  const NodeClass = nodeModule.default;

  if (NodeClass) {
    // Use the file name (without extension) as the key
    const nodeName = path.basename(file);
    InstalledNodes[nodeName] = NodeClass;
  }
});

export default InstalledNodes;
