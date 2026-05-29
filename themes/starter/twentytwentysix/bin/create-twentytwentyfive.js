#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the project name from command line arguments
const projectName = process.argv[2];

// Check if project name is provided
if (!projectName) {
  console.error('Please specify the project directory:');
  console.error('  npx @fecommunity/reactpress-template-twentytwentyfive <project-directory>');
  process.exit(1);
}

// Create project directory
const projectPath = path.join(process.cwd(), projectName);
if (fs.existsSync(projectPath)) {
  console.error(`Directory ${projectName} already exists.`);
  process.exit(1);
}

console.log(`Creating a new ReactPress blog in ${projectPath}...`);

// Create the project directory
fs.mkdirSync(projectPath, { recursive: true });

// Copy template files
const templatePath = path.join(__dirname, '..');
execSync(`cp -r ${templatePath}/* ${projectPath}/`, { stdio: 'inherit' });

// Update package.json with the new project name
const packageJsonPath = path.join(projectPath, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

packageJson.name = projectName;
// Remove the bin field as it's only needed for the template package
delete packageJson.bin;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Install dependencies
console.log('Installing dependencies...');
process.chdir(projectPath);
execSync('npm install', { stdio: 'inherit' });

console.log(`\nSuccess! Created ${projectName} at ${projectPath}`);
console.log('Inside that directory, you can run several commands:');
console.log();
console.log('  npm run dev');
console.log('    Starts the development server.');
console.log();
console.log('  npm run build');
console.log('    Builds the app for production.');
console.log();
console.log('  npm start');
console.log('    Runs the built app in production mode.');
console.log();
console.log('We suggest that you begin by typing:');
console.log();
console.log(`  cd ${projectName}`);
console.log('  npm run dev');
console.log();