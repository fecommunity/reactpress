#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

// Package information
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

// Pre-publish checks
function checkEnvironment() {
  console.log(chalk.blue('🔍 Running pre-publish checks...'));
  
  try {
    // Check registry
    const registry = execSync('npm config get registry', { encoding: 'utf8' }).trim();
    console.log(chalk.gray(`Registry: ${registry}`));
    
    if (registry !== 'https://registry.npmjs.org' && registry !== 'https://registry.npmjs.org/') {
      console.log(chalk.yellow('⚠️  Registry is not set to official npm registry'));
      console.log(chalk.blue('Setting registry to https://registry.npmjs.org...'));
      execSync('npm config set registry https://registry.npmjs.org');
    }
    
    // Check authentication
    const whoami = execSync('npm whoami --registry https://registry.npmjs.org', { encoding: 'utf8' }).trim();
    console.log(chalk.green(`✅ Authenticated as: ${whoami}`));
    
    console.log(chalk.green('✅ Environment checks passed\n'));
    return true;
  } catch (error) {
    console.log(chalk.red('❌ Environment check failed'));
    console.log(chalk.yellow('💡 Please run: npm login --registry https://registry.npmjs.org'));
    return false;
  }
}

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

// Update package version
function updateVersion(packagePath, newVersion) {
  const pkgPath = path.join(process.cwd(), packagePath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

// Build package
function buildPackage(packagePath, packageName) {
  console.log(chalk.blue(`🔨 Building ${packageName}...`));
  
  try {
    if (packagePath === 'config') {
      execSync('pnpm run build', { cwd: path.join(process.cwd(), packagePath), stdio: 'inherit' });
    } else if (packagePath === 'server') {
      execSync('pnpm run build:server', { cwd: process.cwd(), stdio: 'inherit' });
    } else if (packagePath === 'client') {
      execSync('pnpm run build:client', { cwd: process.cwd(), stdio: 'inherit' });
    } else if (packagePath === 'docs') {
      execSync('pnpm run build:docs', { cwd: process.cwd(), stdio: 'inherit' });
    }
    console.log(chalk.green(`✅ ${packageName} built successfully`));
  } catch (error) {
    console.log(chalk.red(`❌ Failed to build ${packageName}`));
    throw error;
  }
}

// Publish package
function publishPackage(packagePath, packageName, tag = 'latest') {
  console.log(chalk.blue(`📤 Publishing ${packageName}...`));
  
  try {
    const packageDir = path.join(process.cwd(), packagePath);
    
    // Verify authentication first
    console.log(chalk.gray('🔍 Verifying authentication...'));
    try {
      const whoami = execSync('npm whoami --registry https://registry.npmjs.org', { 
        cwd: packageDir,
        encoding: 'utf8'
      }).trim();
      console.log(chalk.green(`✅ Authenticated as: ${whoami}`));
    } catch (authError) {
      console.log(chalk.red('❌ Not authenticated with npm registry'));
      console.log(chalk.yellow('💡 Please run: npm login --registry https://registry.npmjs.org'));
      throw new Error('Authentication required');
    }
    
    // Ensure we're using the official npm registry
    execSync('npm config set registry https://registry.npmjs.org', { 
      cwd: packageDir,
      stdio: 'pipe' 
    });
    
    // Build publish command
    const cmd = tag === 'latest' 
      ? 'npm publish --access public --registry https://registry.npmjs.org' 
      : `npm publish --access public --tag ${tag} --registry https://registry.npmjs.org`;
    
    console.log(chalk.gray(`Running: ${cmd}`));
    execSync(cmd, { cwd: packageDir, stdio: 'inherit' });
    console.log(chalk.green(`✅ ${packageName} published successfully`));
  } catch (error) {
    console.log(chalk.red(`❌ Failed to publish ${packageName}`));
    console.log(chalk.yellow('💡 Troubleshooting tips:'));
    console.log(chalk.gray('   1. Make sure you are logged in: npm login --registry https://registry.npmjs.org'));
    console.log(chalk.gray('   2. Check your npm registry: npm config get registry'));
    console.log(chalk.gray('   3. Verify package name is available: npm view @reactpress/package-name'));
    console.log(chalk.gray('   4. Check if you have publish permissions to @reactpress org'));
    console.log(chalk.gray('   5. Clear npm cache: npm cache clean --force'));
    throw error;
  }
}

// Main function
async function main() {
  console.log(chalk.blue('📦 ReactPress Package Publisher\n'));
  
  // Run environment checks
  if (!checkEnvironment()) {
    process.exit(1);
  }
  
  // Show current versions
  console.log(chalk.cyan('📋 Current package versions:'));
  packages.forEach(pkg => {
    const version = getCurrentVersion(pkg.path);
    console.log(chalk.gray(`  ${pkg.name}: ${version}`));
  });
  console.log();
  
  // Ask for publishing options
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '🚀 Publish all packages with version bump', value: 'publish-all' },
        { name: '📦 Publish specific package', value: 'publish-one' },
        { name: '🔨 Build all packages only', value: 'build-all' },
        { name: '🏷️  Publish as beta/alpha', value: 'publish-prerelease' },
        { name: '❌ Cancel', value: 'cancel' }
      ]
    }
  ]);
  
  if (action === 'cancel') {
    console.log(chalk.yellow('Operation cancelled.'));
    return;
  }
  
  if (action === 'build-all') {
    console.log(chalk.blue('🔨 Building all packages...\n'));
    for (const pkg of packages) {
      if (fs.existsSync(path.join(process.cwd(), pkg.path))) {
        buildPackage(pkg.path, pkg.name);
      } else {
        console.log(chalk.yellow(`⚠️  Package ${pkg.name} directory not found, skipping...`));
      }
    }
    console.log(chalk.green('\n🎉 All packages built successfully!'));
    return;
  }
  
  if (action === 'publish-one') {
    const { selectedPackage } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedPackage',
        message: 'Which package would you like to publish?',
        choices: packages.map(pkg => ({
          name: `${pkg.name} (${pkg.description})`,
          value: pkg
        }))
      }
    ]);
    
    const { newVersion } = await inquirer.prompt([
      {
        type: 'input',
        name: 'newVersion',
        message: `Enter new version for ${selectedPackage.name} (current: ${getCurrentVersion(selectedPackage.path)}):`,
        validate: (input) => {
          const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/;
          return semverRegex.test(input) || 'Please enter a valid semver version (e.g., 1.0.0)';
        }
      }
    ]);
    
    updateVersion(selectedPackage.path, newVersion);
    buildPackage(selectedPackage.path, selectedPackage.name);
    publishPackage(selectedPackage.path, selectedPackage.name);
    
    console.log(chalk.green(`\n🎉 ${selectedPackage.name} v${newVersion} published successfully!`));
    return;
  }
  
  if (action === 'publish-prerelease') {
    const { tag } = await inquirer.prompt([
      {
        type: 'list',
        name: 'tag',
        message: 'Select prerelease tag:',
        choices: ['beta', 'alpha', 'rc', 'next']
      }
    ]);
    
    const { versionType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'versionType',
        message: 'Version bump type:',
        choices: [
          { name: 'Patch (1.0.0 -> 1.0.1)', value: 'patch' },
          { name: 'Minor (1.0.0 -> 1.1.0)', value: 'minor' },
          { name: 'Major (1.0.0 -> 2.0.0)', value: 'major' },
          { name: 'Custom version', value: 'custom' }
        ]
      }
    ]);
    
    for (const pkg of packages) {
      if (!fs.existsSync(path.join(process.cwd(), pkg.path))) {
        console.log(chalk.yellow(`⚠️  Package ${pkg.name} directory not found, skipping...`));
        continue;
      }
      
      let newVersion;
      if (versionType === 'custom') {
        const { customVersion } = await inquirer.prompt([
          {
            type: 'input',
            name: 'customVersion',
            message: `Enter version for ${pkg.name}:`,
            default: getCurrentVersion(pkg.path)
          }
        ]);
        newVersion = customVersion;
      } else {
        // Auto increment version for prerelease
        const currentVersion = getCurrentVersion(pkg.path);
        
        if (currentVersion.includes(`-${tag}.`)) {
          // Already a prerelease version, increment the prerelease number
          const [baseVersion, prereleasePart] = currentVersion.split(`-${tag}.`);
          const prereleaseNumber = parseInt(prereleasePart, 10);
          newVersion = `${baseVersion}-${tag}.${prereleaseNumber + 1}`;
        } else {
          // First prerelease version
          const versionParts = currentVersion.split('-')[0]; // Remove any existing prerelease tags
          const [major, minor, patch] = versionParts.split('.').map(v => parseInt(v, 10));
          
          switch (versionType) {
            case 'patch':
              newVersion = `${major}.${minor}.${patch + 1}-${tag}.0`;
              break;
            case 'minor':
              newVersion = `${major}.${minor + 1}.0-${tag}.0`;
              break;
            case 'major':
              newVersion = `${major + 1}.0.0-${tag}.0`;
              break;
          }
        }
      }
      
      updateVersion(pkg.path, newVersion);
      buildPackage(pkg.path, pkg.name);
      publishPackage(pkg.path, pkg.name, tag);
    }
    
    console.log(chalk.green(`\n🎉 All packages published with ${tag} tag!`));
    return;
  }
  
  if (action === 'publish-all') {
    const { versionType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'versionType',
        message: 'Version bump type:',
        choices: [
          { name: 'Patch (1.0.0 -> 1.0.1)', value: 'patch' },
          { name: 'Minor (1.0.0 -> 1.1.0)', value: 'minor' },
          { name: 'Major (1.0.0 -> 2.0.0)', value: 'major' },
          { name: 'Custom version', value: 'custom' }
        ]
      }
    ]);
    
    let baseVersion;
    if (versionType === 'custom') {
      const { customVersion } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customVersion',
          message: 'Enter new version for all packages:',
          validate: (input) => {
            const semverRegex = /^\d+\.\d+\.\d+$/;
            return semverRegex.test(input) || 'Please enter a valid semver version (e.g., 1.0.0)';
          }
        }
      ]);
      baseVersion = customVersion;
    } else {
      // Use the highest current version as base
      const versions = packages.map(pkg => {
        const version = getCurrentVersion(pkg.path);
        const versionParts = version.split('-')[0]; // Remove any existing prerelease tags
        const [major, minor, patch] = versionParts.split('.').map(v => parseInt(v, 10));
        return { major, minor, patch };
      });
      
      const maxVersion = versions.reduce((max, current) => {
        if (current.major > max.major) return current;
        if (current.major === max.major && current.minor > max.minor) return current;
        if (current.major === max.major && current.minor === max.minor && current.patch > max.patch) return current;
        return max;
      });
      
      switch (versionType) {
        case 'patch':
          baseVersion = `${maxVersion.major}.${maxVersion.minor}.${maxVersion.patch + 1}`;
          break;
        case 'minor':
          baseVersion = `${maxVersion.major}.${maxVersion.minor + 1}.0`;
          break;
        case 'major':
          baseVersion = `${maxVersion.major + 1}.0.0`;
          break;
      }
    }
    
    console.log(chalk.cyan(`\n📋 Will publish all packages with version: ${baseVersion}\n`));
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to proceed?',
        default: false
      }
    ]);
    
    if (!confirm) {
      console.log(chalk.yellow('Operation cancelled.'));
      return;
    }
    
    // Update versions, build and publish
    for (const pkg of packages) {
      if (!fs.existsSync(path.join(process.cwd(), pkg.path))) {
        console.log(chalk.yellow(`⚠️  Package ${pkg.name} directory not found, skipping...`));
        continue;
      }
      
      console.log(chalk.blue(`\n📦 Processing ${pkg.name}...`));
      updateVersion(pkg.path, baseVersion);
      buildPackage(pkg.path, pkg.name);
      publishPackage(pkg.path, pkg.name);
    }
    
    // Update root package.json version
    updateVersion('.', baseVersion);
    
    console.log(chalk.green(`\n🎉 All packages published successfully with version ${baseVersion}!`));
    console.log(chalk.cyan('\n📋 Next steps:'));
    console.log(chalk.gray('1. Create a git tag: git tag v' + baseVersion));
    console.log(chalk.gray('2. Push changes: git push && git push --tags'));
    console.log(chalk.gray('3. Create a GitHub release'));
  }
}

main().catch(error => {
  console.error(chalk.red('❌ Publishing failed:'), error);
  process.exit(1);
});