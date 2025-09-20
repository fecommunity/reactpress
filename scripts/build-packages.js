#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Package build order (dependencies first)
const packages = [
  {
    name: '@fecommunity/reactpress-config',
    path: 'config',
    description: 'Configuration management package'
  },
  {
    name: '@fecommunity/reactpress-server', 
    path: 'server',
    description: 'Backend API server package'
  },
  {
    name: '@fecommunity/reactpress-client',
    path: 'client', 
    description: 'Frontend application package'
  }
];

// Get current versions
function getCurrentVersion(packagePath) {
  try {
    const pkgPath = path.join(process.cwd(), packagePath, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version;
  } catch (error) {
    return 'unknown';
  }
}

// Fix workspace dependencies for build
function fixWorkspaceDependenciesForBuild(packagePath) {
  console.log(chalk.blue(`🔧 Fixing workspace dependencies for build: ${packagePath}...`));
  
  const pkgPath = path.join(process.cwd(), packagePath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  // Fix dependencies
  const depTypes = ['dependencies', 'devDependencies', 'peerDependencies'];
  
  depTypes.forEach(depType => {
    if (pkg[depType]) {
      Object.keys(pkg[depType]).forEach(depName => {
        // Check if it's a workspace dependency
        if (pkg[depType][depName] === 'workspace:*' || pkg[depType][depName].startsWith('workspace:')) {
          // For build purposes, we'll use the file: protocol to reference local packages
          const depPackage = packages.find(p => p.name === depName);
          if (depPackage) {
            console.log(chalk.gray(`  Replacing ${depName} workspace dependency with file reference`));
            pkg[depType][depName] = `file:../${depPackage.path}`;
          }
        }
      });
    }
  });
  
  // Write the updated package.json
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(chalk.green(`✅ Workspace dependencies fixed for build: ${packagePath}`));
}

// Restore workspace dependencies after build
function restoreWorkspaceDependenciesAfterBuild(packagePath) {
  console.log(chalk.blue(`🔄 Restoring workspace dependencies after build: ${packagePath}...`));
  
  const pkgPath = path.join(process.cwd(), packagePath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  // Restore dependencies
  const depTypes = ['dependencies', 'devDependencies', 'peerDependencies'];
  
  depTypes.forEach(depType => {
    if (pkg[depType]) {
      Object.keys(pkg[depType]).forEach(depName => {
        // Check if this is one of our internal packages referenced with file:
        const depPackage = packages.find(p => p.name === depName);
        if (depPackage && pkg[depType][depName].startsWith('file:')) {
          console.log(chalk.gray(`  Restoring ${depName} to workspace dependency`));
          pkg[depType][depName] = 'workspace:*';
        }
      });
    }
  });
  
  // Write the updated package.json
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(chalk.green(`✅ Workspace dependencies restored after build: ${packagePath}`));
}

// Build package
function buildPackage(pkg) {
  console.log(chalk.blue(`\n🔨 Building ${pkg.name} (${pkg.description})...`));
  
  try {
    // Fix workspace dependencies for build
    fixWorkspaceDependenciesForBuild(pkg.path);
    
    try {
      if (pkg.path === 'config') {
        execSync('pnpm run build', { cwd: path.join(process.cwd(), pkg.path), stdio: 'inherit' });
      } else if (pkg.path === 'server') {
        execSync('pnpm run prebuild && pnpm run build', { cwd: path.join(process.cwd(), pkg.path), stdio: 'inherit' });
      } else if (pkg.path === 'client') {
        execSync('pnpm run prebuild && pnpm run build', { cwd: path.join(process.cwd(), pkg.path), stdio: 'inherit' });
      }
      console.log(chalk.green(`✅ ${pkg.name} built successfully`));
    } finally {
      // Always restore workspace dependencies
      restoreWorkspaceDependenciesAfterBuild(pkg.path);
    }
  } catch (error) {
    console.log(chalk.red(`❌ Failed to build ${pkg.name}`));
    throw error;
  }
}

// Main function
async function main() {
  console.log(chalk.blue('🏗️  ReactPress Package Builder\n'));
  
  // Show current versions
  console.log(chalk.cyan('📋 Current package versions:'));
  packages.forEach(pkg => {
    const version = getCurrentVersion(pkg.path);
    console.log(chalk.gray(`  ${pkg.name}: ${version}`));
  });
  console.log();
  
  try {
    // Build packages in order
    for (const pkg of packages) {
      if (fs.existsSync(path.join(process.cwd(), pkg.path))) {
        await buildPackage(pkg);
      } else {
        console.log(chalk.yellow(`⚠️  Package ${pkg.name} directory not found, skipping...`));
      }
    }
    
    console.log(chalk.green('\n🎉 All packages built successfully!'));
  } catch (error) {
    console.error(chalk.red('❌ Build failed:'), error);
    process.exit(1);
  }
}

// Check if called with --publish flag
if (process.argv.includes('--publish')) {
  // When called with --publish, we only show the header and versions but don't build
  // The publish script will handle building as needed
  console.log(chalk.blue('🏗️  ReactPress Package Builder\n'));
  
  // Show current versions
  console.log(chalk.cyan('📋 Current package versions:'));
  packages.forEach(pkg => {
    const version = getCurrentVersion(pkg.path);
    console.log(chalk.gray(`  ${pkg.name}: ${version}`));
  });
  console.log();
  
  // Don't build packages here, just start the publish process
  console.log(chalk.blue('\n🚀 Starting publish process...'));
  // Execute publish script
  const { spawn } = require('child_process');
  const publishProcess = spawn('node', ['scripts/publish-packages.js', '--release'], { stdio: 'inherit' });
  
  publishProcess.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green('\n✅ Build and publish completed successfully!'));
    } else {
      console.log(chalk.red('\n❌ Publish process failed!'));
      process.exit(code);
    }
  });
} else {
  main();
}
