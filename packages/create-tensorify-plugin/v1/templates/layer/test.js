const plugin = require('./src/index.js');

console.log('🧪 Testing {{projectName}} Plugin\n');

// Test plugin structure
console.log('✅ Plugin loaded:', plugin.name);
console.log('✅ Available nodes:', Object.keys(plugin.nodes));

// Test node creation
const exampleNode = new plugin.nodes.ExampleNode();
console.log('✅ Node created:', exampleNode.name);

// Test validation
try {
  exampleNode.validate();
  console.log('✅ Node validation passed');
} catch (error) {
  console.error('❌ Node validation failed:', error.message);
  process.exit(1);
}

// Test code generation with different settings
const testCases = [
  { factor: 2.0, operation: 'multiply' },
  { factor: 5.0, operation: 'add' },
  { factor: 1.0, operation: 'subtract', message: 'Custom test message' }
];

for (const testCase of testCases) {
  console.log(`\n🔧 Testing with settings:`, testCase);
  
  const result = exampleNode.testCodeGeneration(testCase);
  
  if (result.success) {
    console.log('✅ Code generation successful');
    console.log('  Imports:', result.result.imports.length);
    console.log('  Instantiations:', result.result.instantiations.length);
  } else {
    console.error('❌ Code generation failed:', result.error);
    process.exit(1);
  }
}

console.log('\n🎉 All tests passed! Your plugin is ready to use.');
console.log('\nNext steps:');
console.log('1. Run "npm run build" to compile TypeScript');
console.log('2. Customize your node in src/index.js');
console.log('3. Add more nodes as needed');
console.log('4. Test with real Tensorify integration'); 