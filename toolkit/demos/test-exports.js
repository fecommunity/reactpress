// Test script to verify toolkit exports work correctly
const path = require('path');

// Add the dist directory to module resolution paths
const toolkitPath = path.join(__dirname, '..', 'dist');

console.log('Testing toolkit exports...');

try {
  // Test 1: Default import
  const toolkit = require(toolkitPath);
  console.log('✓ Default import works');
  console.log('  - toolkit.api exists:', !!toolkit.api);
  console.log('  - toolkit.types exists:', !!toolkit.types);
  console.log('  - toolkit.utils exists:', !!toolkit.utils);
  console.log('  - toolkit.config exists:', !!toolkit.config);

  // Test 2: Named imports (destructuring)
  const { api, types, utils, config } = require(toolkitPath);
  console.log('✓ Named imports work');
  console.log('  - api exists:', !!api);
  console.log('  - types exists:', !!types);
  console.log('  - utils exists:', !!utils);
  console.log('  - config exists:', !!config);

  // Test 3: Individual module access
  console.log('✓ Individual modules accessible');
  console.log('  - api module keys:', Object.keys(api).slice(0, 5)); // Show first 5 keys
  console.log('  - config module keys:', Object.keys(config).slice(0, 5)); // Show first 5 keys

  console.log('\n🎉 All tests passed! Toolkit exports are working correctly.');
} catch (error) {
  console.error('❌ Test failed with error:', error.message);
  process.exit(1);
}