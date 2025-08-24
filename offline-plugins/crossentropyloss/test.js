const plugin = require("./dist/index.js");

console.log("🧪 Testing {{projectName}} Plugin\n");

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
let pluginInstance;
try {
  pluginInstance = new plugin.default();
  console.log("✅ Plugin instantiated successfully");
} catch (error) {
  console.error("❌ Failed to instantiate plugin:", error.message);
  process.exit(1);
}

// Test code generation with different settings
const testCases = [
  {}, // Default settings
  { exampleSetting: "custom-value" },
  { exampleSetting: "another-value" },
];

console.log("\n🔧 Testing code generation...\n");

for (let i = 0; i < testCases.length; i++) {
  const testCase = testCases[i];
  console.log(`Test ${i + 1}: ${JSON.stringify(testCase)}`);

  try {
    // Test validation
    pluginInstance.validateSettings(testCase);
    console.log("  ✅ Settings validation passed");

    // Test code generation
    const code = pluginInstance.getTranslationCode(testCase);
    console.log("  ✅ Code generation successful");
    console.log("  📝 Generated code:");
    console.log(
      code
        .split("\n")
        .map((line) => "    " + line)
        .join("\n")
    );

    // Test dependencies
    const deps = pluginInstance.getDependencies();
    console.log(
      "  📦 Dependencies:",
      deps.length > 0 ? deps.join(", ") : "none"
    );

    // Test imports
    const imports = pluginInstance.getImports();
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
console.log("1. Implement your plugin logic in src/index.ts");
console.log("2. Update the settings interface for your specific use case");
console.log("3. Add proper validation and code generation logic");
console.log("4. Build and test: pnpm run build && npm test");
console.log("5. Publish your plugin to the Tensorify registry");
