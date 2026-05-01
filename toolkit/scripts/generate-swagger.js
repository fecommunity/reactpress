const { execSync } = require('child_process');
const { unlinkSync, existsSync } = require('fs');
const { join } = require('path');
const { getSwaggerInputPath, getBundledServerPathForGenerate } = require('./resolve-swagger-input');

console.log('🚀 Starting API types generation process...\n');

const bundledServerDir = getBundledServerPathForGenerate();
const swaggerPath = getSwaggerInputPath();

try {
  console.log('1️⃣ Generating Swagger JSON via @fecommunity/reactpress-cli bundled server...');
  try {
    execSync('npm run generate:swagger', { cwd: bundledServerDir, stdio: 'inherit' });
    console.log('✅ Swagger JSON generated successfully!\n');
  } catch (error) {
    console.log('⚠️  Failed to generate new swagger.json, checking for existing file...\n');
  }

  if (!existsSync(swaggerPath)) {
    console.error(`❌ No swagger.json at ${swaggerPath}`);
    console.error('   Ensure @fecommunity/reactpress-cli is installed (pnpm install).');
    process.exit(1);
  }
  console.log(`✅ Using swagger.json from ${swaggerPath}\n`);

  console.log('📝 Note: Only api and types directories will be regenerated. Other src files will remain untouched.\n');
  console.log('2️⃣ Generating TypeScript definitions (api and types only)...');
  execSync('node scripts/generate-api.js', { stdio: 'inherit', cwd: join(__dirname, '..') });
  console.log('✅ TypeScript definitions generated successfully!\n');

  console.log('3️⃣ Cleaning up swagger.json...');
  if (existsSync(swaggerPath)) {
    unlinkSync(swaggerPath);
    console.log('✅ Removed swagger.json from bundled server public/');
  }
  console.log('✅ Cleanup completed!\n');

  console.log('🎉 API generation process completed successfully!');
} catch (error) {
  console.error('❌ Error during generation process:', error.message);
  process.exit(1);
}
