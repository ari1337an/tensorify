const plugin = require("./dist/index.js");

console.log("🧪 Testing {{projectName}} Linear Layer Plugin\n");

// Test plugin loading
try {
  console.log("✅ Plugin loaded successfully");
  console.log("📦 Plugin name:", plugin.default.prototype.name);
  console.log("🔧 Plugin type:", plugin.default.prototype.nodeType);
} catch (error) {
  console.error("❌ Failed to load plugin:", error.message);
  process.exit(1);
}

// Test plugin instantiation
let linearLayer;
try {
  linearLayer = new plugin.default();
  console.log("✅ Plugin instantiated successfully");
} catch (error) {
  console.error("❌ Failed to instantiate plugin:", error.message);
  process.exit(1);
}

// Test code generation with different settings
const testCases = [
  { inFeatures: 784, outFeatures: 128 },
  { inFeatures: 128, outFeatures: 64, bias: false },
  { inFeatures: 512, outFeatures: 256, bias: true },
];

console.log("\n🔧 Testing code generation...\n");

for (let i = 0; i < testCases.length; i++) {
  const testCase = testCases[i];
  console.log(`Test ${i + 1}: ${JSON.stringify(testCase)}`);

  try {
    // Test validation
    linearLayer.validateSettings(testCase);
    console.log("  ✅ Settings validation passed");

    // Test code generation
    const code = linearLayer.getTranslationCode(testCase);
    console.log("  ✅ Code generation successful");
    console.log("  📝 Generated code:");
    console.log(
      code
        .split("\n")
        .map((line) => "    " + line)
        .join("\n")
    );

    // Test dependencies
    const deps = linearLayer.getDependencies();
    console.log("  📦 Dependencies:", deps.join(", "));

    // Test imports
    const imports = linearLayer.getImports();
    console.log("  📥 Imports:", imports.length, "statements");
  } catch (error) {
    console.error("  ❌ Test failed:", error.message);
    process.exit(1);
  }

  console.log("");
}

console.log(
  "🎉 All tests passed! Your {{projectName}} plugin is working correctly."
);
console.log("\nNext steps:");
console.log("1. Customize the linear layer implementation in src/index.ts");
console.log("2. Add more features or validation as needed");
console.log("3. Build and test: pnpm run build && npm test");
console.log("4. Publish your plugin to the Tensorify registry");
