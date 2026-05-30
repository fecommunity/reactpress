#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectName = process.argv[2];

if (!projectName) {
  console.error('Please specify the project directory:');
  console.error('  npx @fecommunity/reactpress-template-twentytwentysix <project-directory>');
  process.exit(1);
}

const projectPath = path.join(process.cwd(), projectName);
if (fs.existsSync(projectPath)) {
  console.error(`Directory ${projectName} already exists.`);
  process.exit(1);
}

console.log(`Creating a new ReactPress blog in ${projectPath}...`);
fs.mkdirSync(projectPath, { recursive: true });

const templatePath = path.join(__dirname, '..');
execSync(`cp -r ${templatePath}/* ${projectPath}/`, { stdio: 'inherit' });

const packageJsonPath = path.join(projectPath, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
packageJson.name = projectName;
delete packageJson.bin;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Installing dependencies...');
process.chdir(projectPath);
execSync('npm install', { stdio: 'inherit' });

console.log(`\nSuccess! Created ${projectName} at ${projectPath}`);
console.log('  cd ' + projectName);
console.log('  npm run dev');
