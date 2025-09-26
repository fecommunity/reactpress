const { execSync } = require('child_process');
const { unlinkSync, existsSync } = require('fs');
const { join } = require('path');

console.log('🚀 Starting API types generation process...\n');

try {
  // Step 1: Enter server directory and generate swagger.json
  console.log('1️⃣ Generating Swagger JSON in server directory...');
  try {
    execSync('cd ../server && npm run generate:swagger', { stdio: 'inherit' });
    console.log('✅ Swagger JSON generated successfully in server directory!\n');
  } catch (error) {
    console.log('⚠️  Failed to generate new swagger.json, checking for existing file...\n');
  }

  // Step 2: Check if swagger.json exists in server directory
  const serverSwaggerPath = join(__dirname, '../../server/public/swagger.json');
  if (!existsSync(serverSwaggerPath)) {
    console.error('❌ No swagger.json file available in server directory');
    process.exit(1);
  }
  console.log('✅ Using swagger.json from server directory!\n');

  // Step 3: Generate TypeScript definitions (only updates api and types directories)
  console.log('📝 Note: Only api and types directories will be regenerated. Other src files will remain untouched.\n');
  console.log('2️⃣ Generating TypeScript definitions (api and types only)...');
  execSync('node scripts/generate-api.js', { stdio: 'inherit' });
  console.log('✅ TypeScript definitions generated successfully!\n');

  // Step 4: Clean up - remove swagger.json from server directory
  console.log('3️⃣ Cleaning up swagger.json files...');
  
  // Remove from server directory
  if (existsSync(serverSwaggerPath)) {
    unlinkSync(serverSwaggerPath);
    console.log('✅ Removed swagger.json from server directory');
  }
  
  console.log('✅ Cleanup completed!\n');

  console.log('🎉 API generation process completed successfully!');
  console.log('📁 Only api and types directories were updated. Other src files remain untouched.');

} catch (error) {
  console.error('❌ Error during generation process:', error.message);
  process.exit(1);
}