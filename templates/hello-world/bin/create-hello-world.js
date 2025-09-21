#!/usr/bin/env node

/**
 * ReactPress Hello World Template CLI
 * This script creates a new ReactPress project using the hello-world template
 */

const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');

// Get command line arguments
const args = process.argv.slice(2);
const projectName = args[0];

// Show help if no project name is provided or help is requested
if (!projectName || args.includes('--help') || args.includes('-h')) {
  console.log(`
ReactPress Hello World Template

Usage:
  npx @fecommunity/reactpress-template-hello-world <project-name>

Arguments:
  project-name    The name of your new ReactPress project

Options:
  --help, -h      Show this help message

Examples:
  npx @fecommunity/reactpress-template-hello-world my-blog

Template Features:
  - Minimal and clean design
  - Responsive layout
  - Easy to customize
  - Built with TypeScript
  - Next.js Pages Router
  - Integrated with ReactPress Toolkit
  - Includes demo pages showing toolkit usage

Demo Pages:
  - Home page with data fetching using ReactPress Toolkit
  - About page with site information
  - Toolkit Demo page showcasing API usage examples

To get started after installation:
  cd ${projectName}
  npm run dev
  Visit http://localhost:3000 in your browser
  `);
  process.exit(0);
}

// Get the directory where this script is located
const binDir = __dirname;
const templateDir = path.join(binDir, '..');

// Get the current working directory
const cwd = process.cwd();

// Create the project directory
const projectDir = path.join(cwd, projectName);

async function createProject() {
  try {
    console.log(`Creating ReactPress project: ${projectName}`);
    
    // Check if project directory already exists
    if (fs.existsSync(projectDir)) {
      console.error(`Error: Directory ${projectName} already exists`);
      process.exit(1);
    }
    
    // Copy template files to project directory
    console.log('Copying template files...');
    await fs.copy(templateDir, projectDir, {
      filter: (src) => {
        // Don't copy the bin directory
        return !src.includes('bin');
      }
    });
    
    // Change to project directory
    process.chdir(projectDir);
    
    // Update package.json with project name
    console.log('Updating package.json...');
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    
    // Install dependencies
    console.log('Installing dependencies...');
    const npmInstall = spawn('npm', ['install'], {
      stdio: 'inherit',
      cwd: projectDir
    });
    
    npmInstall.on('close', (code) => {
      if (code === 0) {
        console.log(`
🎉 Successfully created ReactPress project: ${projectName}

To get started:
  cd ${projectName}
  npm run dev

Visit http://localhost:3000 in your browser to see your new ReactPress site!

Demo Pages:
  - Home (/): Main page with data fetching
  - About (/about): Site information
  - Toolkit Demo (/toolkit-demo): Showcase of ReactPress Toolkit usage

The template demonstrates how to use the ReactPress Toolkit for data fetching:
  - createApiInstance() for custom API configuration
  - API methods like article.findAll(), category.findAll(), tag.findAll()
  - Error handling and data processing
        `);
      } else {
        console.error('Failed to install dependencies');
        process.exit(1);
      }
    });
    
    npmInstall.on('error', (error) => {
      console.error('Failed to start npm install:', error);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('Error creating project:', error);
    process.exit(1);
  }
}

createProject();