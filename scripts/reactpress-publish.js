#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const crypto = require('crypto');

// Package build order (dependencies first)
const packages = [
  {
    name: '@fecommunity/reactpress',
    path: '.',
    description: 'Main ReactPress package'
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
  },
  {
    name: '@fecommunity/reactpress-toolkit',
    path: 'toolkit',
    description: 'API client and utilities toolkit'
  },
  {
    name: '@fecommunity/reactpress-template-hello-world',
    path: 'templates/hello-world',
    description: 'Hello World template for ReactPress'
  },
  {
    name: '@fecommunity/reactpress-template-twentytwentyfive',
    path: 'templates/twentytwentyfive',
    description: 'Twenty Twenty Five blog template for ReactPress'
  }
];

// Generate a hash for a file or directory
function generateHash(filePath) {
  try {
    if (fs.statSync(filePath).isDirectory()) {
      const files = fs.readdirSync(filePath);
      const hashes = files
        .filter(file => !file.startsWith('.') && file !== 'node_modules' && file !== 'dist' && file !== '.next') // Ignore hidden files and build directories
        .map(file => generateHash(path.join(filePath, file)))
        .sort();
      return crypto.createHash('md5').update(hashes.join('')).digest('hex');
    } else {
      const content = fs.readFileSync(filePath);
      return crypto.createHash('md5').update(content).digest('hex');
    }
  } catch (error) {
    return '';
  }
}

// Get package content hash
function getPackageHash(packagePath) {
  const fullPath = path.join(process.cwd(), packagePath);
  return generateHash(fullPath);
}

// Check if package has meaningful changes (for build)
function hasMeaningfulChangesForBuild(packagePath, packageName) {
  try {
    // Create a hash file path to store previous hash in node_modules
    const hashFilePath = path.join(process.cwd(), 'node_modules', '.build-cache', `${packageName.replace('/', '_')}.hash`);
    
    // Generate current hash
    const currentHash = getPackageHash(packagePath);
    
    // Check if we have a previous hash
    if (fs.existsSync(hashFilePath)) {
      const previousHash = fs.readFileSync(hashFilePath, 'utf8').trim();
      return currentHash !== previousHash;
    }
    
    // If no previous hash, consider it as having changes
    return true;
  } catch (error) {
    console.log(chalk.yellow(`⚠️  Could not check changes for ${packageName}, assuming changes exist`));
    return true;
  }
}

// Check if package has meaningful changes (for publish)
function hasMeaningfulChangesForPublish(packagePath, packageName) {
  try {
    // Create a hash file path to store previous hash in node_modules
    const hashFilePath = path.join(process.cwd(), 'node_modules', '.publish-cache', `${packageName.replace('/', '_')}.hash`);
    
    // Generate current hash
    const currentHash = getPackageHash(packagePath);
    
    // Check if we have a previous hash
    if (fs.existsSync(hashFilePath)) {
      const previousHash = fs.readFileSync(hashFilePath, 'utf8').trim();
      return currentHash !== previousHash;
    }
    
    // If no previous hash, consider it as having changes
    return true;
  } catch (error) {
    console.log(chalk.yellow(`⚠️  Could not check changes for ${packageName}, assuming changes exist`));
    return true;
  }
}

// Save package hash (for build)
function savePackageHashForBuild(packagePath, packageName) {
  try {
    const hashFilePath = path.join(process.cwd(), 'node_modules', '.build-cache', `${packageName.replace('/', '_')}.hash`);
    
    // Ensure cache directory exists
    const cacheDir = path.dirname(hashFilePath);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    // Generate and save current hash
    const currentHash = getPackageHash(packagePath);
    fs.writeFileSync(hashFilePath, currentHash);
  } catch (error) {
    console.log(chalk.yellow(`⚠️  Could not save hash for ${packageName}`));
  }
}

// Save package hash (for publish)
function savePackageHashForPublish(packagePath, packageName) {
  try {
    const hashFilePath = path.join(process.cwd(), 'node_modules', '.publish-cache', `${packageName.replace('/', '_')}.hash`);
    
    // Ensure cache directory exists
    const cacheDir = path.dirname(hashFilePath);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    // Generate and save current hash
    const currentHash = getPackageHash(packagePath);
    fs.writeFileSync(hashFilePath, currentHash);
  } catch (error) {
    console.log(chalk.yellow(`⚠️  Could not save hash for ${packageName}`));
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

// Increment version based on type
function incrementVersion(version, type) {
  const parts = version.split('-')[0].split('.');
  const major = parseInt(parts[0]);
  const minor = parseInt(parts[1]);
  const patch = parseInt(parts[2]);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'beta':
      // For beta, we increment the beta number or add beta.1 if not present
      const match = version.match(/^(.*)-beta\.(\d+)$/);
      if (match) {
        const baseVersion = match[1];
        const betaNumber = parseInt(match[2]);
        return `${baseVersion}-beta.${betaNumber + 1}`;
      } else {
        // If no beta version exists, add beta.1
        return `${version}-beta.1`;
      }
    case 'alpha':
      // For alpha, we increment the alpha number or add alpha.1 if not present
      const alphaMatch = version.match(/^(.*)-alpha\.(\d+)$/);
      if (alphaMatch) {
        const baseVersion = alphaMatch[1];
        const alphaNumber = parseInt(alphaMatch[2]);
        return `${baseVersion}-alpha.${alphaNumber + 1}`;
      } else {
        // If no alpha version exists, add alpha.1
        return `${version}-alpha.1`;
      }
    default:
      return version;
  }
}

// Get next available version from npm registry
function getNextAvailableVersion(packageName, currentVersion, versionType) {
  try {
    // First, increment the version locally
    let nextVersion = incrementVersion(currentVersion, versionType);
    
    // Check if this version already exists on npm
    let versionExists = true;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loop
    
    while (versionExists && attempts < maxAttempts) {
      try {
        execSync(`npm view ${packageName}@${nextVersion} version`, { stdio: 'ignore' });
        // If we get here, the version exists, so we need to increment again
        nextVersion = incrementVersion(nextVersion, versionType);
        attempts++;
      } catch (error) {
        // If we get an error, the version doesn't exist, which is what we want
        versionExists = false;
      }
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('Too many attempts to find available version');
    }
    
    return nextVersion;
  } catch (error) {
    // Fallback to simple increment if npm view fails
    console.log(chalk.yellow(`⚠️  Could not check npm registry, using local increment for ${packageName}`));
    return incrementVersion(currentVersion, versionType);
  }
}

// Update package version
function updateVersion(packagePath, newVersion) {
  console.log(chalk.blue(`\n✏️  Updating version to ${newVersion}...`));
  
  const pkgPath = path.join(process.cwd(), packagePath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  const oldVersion = pkg.version;
  pkg.version = newVersion;
  
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(chalk.green(`✅ Version updated from ${oldVersion} to ${newVersion}`));
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

// Fix workspace dependencies for publish
function fixWorkspaceDependenciesForPublish(packagePath, packageVersions) {
  console.log(chalk.blue(`🔧 Fixing workspace dependencies for publish: ${packagePath}...`));
  
  const pkgPath = path.join(process.cwd(), packagePath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  // Fix dependencies
  const depTypes = ['dependencies', 'devDependencies', 'peerDependencies'];
  
  depTypes.forEach(depType => {
    if (pkg[depType]) {
      Object.keys(pkg[depType]).forEach(depName => {
        // Check if it's a workspace dependency
        if (pkg[depType][depName] === 'workspace:*' || pkg[depType][depName].startsWith('workspace:')) {
          // Replace with actual version
          const depPackage = packages.find(p => p.name === depName);
          if (depPackage && packageVersions[depName]) {
            console.log(chalk.gray(`  Replacing ${depName} workspace dependency with version ${packageVersions[depName]}`));
            pkg[depType][depName] = packageVersions[depName];
          }
        }
      });
    }
  });
  
  // Write the updated package.json
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(chalk.green(`✅ Workspace dependencies fixed for publish: ${packagePath}`));
}

// Restore workspace dependencies after publish
function restoreWorkspaceDependenciesAfterPublish(packagePath) {
  console.log(chalk.blue(`🔄 Restoring workspace dependencies for ${packagePath}...`));
  
  const pkgPath = path.join(process.cwd(), packagePath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  // Restore dependencies
  const depTypes = ['dependencies', 'devDependencies', 'peerDependencies'];
  
  depTypes.forEach(depType => {
    if (pkg[depType]) {
      Object.keys(pkg[depType]).forEach(depName => {
        // Check if this is one of our internal packages
        const depPackage = packages.find(p => p.name === depName);
        if (depPackage) {
          console.log(chalk.gray(`  Restoring ${depName} to workspace dependency`));
          pkg[depType][depName] = 'workspace:*';
        }
      });
    }
  });
  
  // Write the updated package.json
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(chalk.green(`✅ Workspace dependencies restored for ${packagePath}`));
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
      } else if (pkg.path === 'toolkit') {
        execSync('pnpm run build', { cwd: path.join(process.cwd(), pkg.path), stdio: 'inherit' });
      } else if (pkg.path === 'templates/hello-world' || pkg.path === 'templates/twentytwentyfive') {
        // Templates don't need to be built, just validate package.json
        console.log(chalk.gray('  Templates do not require building, skipping...'));
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

// Publish package
function publishPackage(packagePath, packageName, tag = 'latest') {
  console.log(chalk.blue(`\n🚀 Publishing ${packageName} with tag ${tag}...`));
  
  try {
    const command = `pnpm publish --access public --tag ${tag} --registry https://registry.npmjs.org --no-git-checks`;
    execSync(command, { cwd: path.join(process.cwd(), packagePath), stdio: 'inherit' });
    console.log(chalk.green(`✅ ${packageName} published successfully!`));
  } catch (error) {
    console.log(chalk.red(`❌ Failed to publish ${packageName}`));
    throw error;
  }
}

// Create GitHub release
function createGitHubRelease(tagName, releaseNotes) {
  console.log(chalk.blue(`\n📝 Creating GitHub release ${tagName}...`));
  
  try {
    // Create release using GitHub CLI if available
    const command = `gh release create ${tagName} --title "${tagName}" --notes "${releaseNotes}"`;
    execSync(command, { stdio: 'inherit' });
    console.log(chalk.green(`✅ GitHub release ${tagName} created successfully!`));
  } catch (error) {
    console.log(chalk.yellow(`⚠️  Failed to create GitHub release (GitHub CLI may not be installed or configured)`));
    console.log(chalk.gray('You can manually create the release at: https://github.com/fecommunity/reactpress/releases/new'));
  }
}

// Check environment
function checkEnvironment() {
  // Check if pnpm is installed
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
  } catch (error) {
    console.log(chalk.red('❌ pnpm is not installed. Please install pnpm first.'));
    return false;
  }
  
  // Check if logged in to npm
  try {
    execSync('pnpm whoami --registry https://registry.npmjs.org', { stdio: 'ignore' });
  } catch (error) {
    console.log(chalk.red('❌ Not logged in to npm. Please run "pnpm login --registry https://registry.npmjs.org" first.'));
    return false;
  }
  
  return true;
}

// Build packages function
async function buildPackages() {
  console.log(chalk.blue('🏗️  ReactPress Package Builder\n'));
  
  // Show current versions
  console.log(chalk.cyan('📋 Current package versions:'));
  packages.forEach(pkg => {
    const version = getCurrentVersion(pkg.path);
    console.log(chalk.gray(`  ${pkg.name}: ${version}`));
  });
  console.log();
  
  try {
    // Track which packages actually need to be built
    const packagesToBuild = [];
    
    // Check for meaningful changes in each package
    for (const pkg of packages) {
      if (fs.existsSync(path.join(process.cwd(), pkg.path))) {
        if (hasMeaningfulChangesForBuild(pkg.path, pkg.name)) {
          packagesToBuild.push(pkg);
          console.log(chalk.blue(`\n📦 ${pkg.name} has changes, will be built`));
        } else {
          console.log(chalk.gray(`\n⏭️  ${pkg.name} has no meaningful changes, skipping...`));
        }
      } else {
        console.log(chalk.yellow(`⚠️  Package ${pkg.name} directory not found, skipping...`));
      }
    }
    
    if (packagesToBuild.length === 0) {
      console.log(chalk.green('\n✅ No packages have meaningful changes. Nothing to build!'));
      return;
    }
    
    // Build packages that have changes
    for (const pkg of packagesToBuild) {
      await buildPackage(pkg);
      // Save the hash after successful build
      savePackageHashForBuild(pkg.path, pkg.name);
    }
    
    console.log(chalk.green(`\n🎉 ${packagesToBuild.length} package(s) built successfully!`));
  } catch (error) {
    console.error(chalk.red('❌ Build failed:'), error);
    process.exit(1);
  }
}

// Publish packages function
async function publishPackages() {
  // Check if called with --no-build flag
  const noBuild = process.argv.includes('--no-build');
  
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
    
    // Track which packages actually need to be built
    const packagesToBuild = [];
    
    // Check for meaningful changes in each package
    for (const pkg of packages) {
      if (fs.existsSync(path.join(process.cwd(), pkg.path))) {
        if (hasMeaningfulChangesForPublish(pkg.path, pkg.name)) {
          packagesToBuild.push(pkg);
          console.log(chalk.blue(`\n📦 ${pkg.name} has changes, will be built`));
        } else {
          console.log(chalk.gray(`\n⏭️  ${pkg.name} has no meaningful changes, skipping...`));
        }
      } else {
        console.log(chalk.yellow(`⚠️  Package ${pkg.name} directory not found, skipping...`));
      }
    }
    
    if (packagesToBuild.length === 0) {
      console.log(chalk.green('\n✅ No packages have meaningful changes. Nothing to build!'));
      return;
    }
    
    // Build packages that have changes
    for (const pkg of packagesToBuild) {
      buildPackage(pkg);
      // Save the hash after successful build
      savePackageHashForPublish(pkg.path, pkg.name);
    }
    
    console.log(chalk.green(`\n🎉 ${packagesToBuild.length} package(s) built successfully!`));
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
    
    // Check if the selected package has meaningful changes
    if (!hasMeaningfulChangesForPublish(selectedPackage.path, selectedPackage.name)) {
      console.log(chalk.gray(`\n⏭️  ${selectedPackage.name} has no meaningful changes, skipping...`));
      console.log(chalk.green('✅ Nothing to publish!'));
      return;
    }
    
    const { versionType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'versionType',
        message: 'Version bump type:',
        choices: [
          { name: 'Beta (1.0.0-beta.1 -> 1.0.0-beta.2)', value: 'beta' },
          { name: 'Patch (1.0.0 -> 1.0.1)', value: 'patch' },
          { name: 'Minor (1.0.0 -> 1.1.0)', value: 'minor' },
          { name: 'Major (1.0.0 -> 2.0.0)', value: 'major' },
          { name: 'Custom version', value: 'custom' }
        ]
      }
    ]);
    
    let newVersion;
    const currentVersion = getCurrentVersion(selectedPackage.path);
    
    if (versionType === 'custom') {
      const { customVersion } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customVersion',
          message: `Enter new version for ${selectedPackage.name} (current: ${currentVersion}):`,
          validate: (input) => {
            const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/;
            return semverRegex.test(input) || 'Please enter a valid semver version (e.g., 1.0.0)';
          }
        }
      ]);
      newVersion = customVersion;
    } else {
      newVersion = getNextAvailableVersion(selectedPackage.name, currentVersion, versionType);
    }
    
    // Get all package versions for dependency resolution
    const packageVersions = {};
    packages.forEach(pkg => {
      packageVersions[pkg.name] = getCurrentVersion(pkg.path);
    });
    // Update the selected package version
    packageVersions[selectedPackage.name] = newVersion;
    
    // Fix workspace dependencies before publishing
    fixWorkspaceDependenciesForPublish(selectedPackage.path, packageVersions);
    
    try {
      updateVersion(selectedPackage.path, newVersion);
      // Only build if not disabled
      if (!noBuild) {
        buildPackage(selectedPackage);
      }
      
      // Determine tag based on version type
      const tag = versionType === 'beta' ? 'beta' : 'latest';
      publishPackage(selectedPackage.path, selectedPackage.name, tag);
      
      // Save the hash after successful publish
      savePackageHashForPublish(selectedPackage.path, selectedPackage.name);
      
      console.log(chalk.green(`\n🎉 ${selectedPackage.name} v${newVersion} published successfully!`));
    } finally {
      // Always restore workspace dependencies
      restoreWorkspaceDependenciesAfterPublish(selectedPackage.path);
    }
    
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
          { name: `Prerelease (${tag})`, value: tag },
          { name: 'Patch (1.0.0 -> 1.0.1)', value: 'patch' },
          { name: 'Minor (1.0.0 -> 1.1.0)', value: 'minor' },
          { name: 'Major (1.0.0 -> 2.0.0)', value: 'major' },
          { name: 'Custom version', value: 'custom' }
        ]
      }
    ]);
    
    // Get all package versions for dependency resolution
    const packageVersions = {};
    packages.forEach(pkg => {
      const currentVersion = getCurrentVersion(pkg.path);
      packageVersions[pkg.name] = currentVersion;
    });
    
    // Track which packages actually need to be published
    const packagesToPublish = [];
    
    // Check for meaningful changes in each package
    for (const pkg of packages) {
      if (!fs.existsSync(path.join(process.cwd(), pkg.path))) {
        console.log(chalk.yellow(`⚠️  Package ${pkg.name} directory not found, skipping...`));
        continue;
      }
      
      if (hasMeaningfulChangesForPublish(pkg.path, pkg.name)) {
        packagesToPublish.push(pkg);
        console.log(chalk.blue(`\n📦 ${pkg.name} has changes, will be published`));
      } else {
        console.log(chalk.gray(`\n⏭️  ${pkg.name} has no meaningful changes, skipping...`));
      }
    }
    
    if (packagesToPublish.length === 0) {
      console.log(chalk.green('\n✅ No packages have meaningful changes. Nothing to publish!'));
      return;
    }
    
    // Process each package that has changes
    for (const pkg of packagesToPublish) {
      let newVersion;
      const currentVersion = getCurrentVersion(pkg.path);
      
      if (versionType === 'custom') {
        const { customVersion } = await inquirer.prompt([
          {
            type: 'input',
            name: 'customVersion',
            message: `Enter version for ${pkg.name} (current: ${currentVersion}):`,
            default: currentVersion
          }
        ]);
        newVersion = customVersion;
      } else {
        newVersion = getNextAvailableVersion(pkg.name, currentVersion, versionType);
      }
      
      // Update package version in our tracking
      packageVersions[pkg.name] = newVersion;
      
      // Fix workspace dependencies before publishing
      fixWorkspaceDependenciesForPublish(pkg.path, packageVersions);
      
      try {
        updateVersion(pkg.path, newVersion);
        // Only build if not disabled
        if (!noBuild) {
          buildPackage(pkg);
        }
        publishPackage(pkg.path, pkg.name, tag);
        
        // Save the hash after successful publish
        savePackageHashForPublish(pkg.path, pkg.name);
      } finally {
        // Always restore workspace dependencies
        restoreWorkspaceDependenciesAfterPublish(pkg.path);
      }
    }
    
    console.log(chalk.green(`\n🎉 ${packagesToPublish.length} package(s) published with ${tag} tag!`));
    return;
  }
  
  if (action === 'publish-all') {
    // Check if we're on master branch for final release
    let isMasterBranch = false;
    try {
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      isMasterBranch = branch === 'master' || branch === 'main';
    } catch (error) {
      console.log(chalk.yellow('⚠️  Unable to determine current branch'));
    }
    
    const { versionType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'versionType',
        message: 'Version bump type:',
        choices: [
          { name: `Beta ${isMasterBranch ? '(will publish as final)' : '(will publish as beta)'}`, value: 'beta' },
          { name: 'Patch (1.0.0 -> 1.0.1)', value: 'patch' },
          { name: 'Minor (1.0.0 -> 1.1.0)', value: 'minor' },
          { name: 'Major (1.0.0 -> 2.0.0)', value: 'major' },
          { name: 'Custom version', value: 'custom' }
        ]
      }
    ]);
    
    // Get all package versions for dependency resolution
    const packageVersions = {};
    const originalVersions = {};
    
    packages.forEach(pkg => {
      const currentVersion = getCurrentVersion(pkg.path);
      originalVersions[pkg.name] = currentVersion;
      packageVersions[pkg.name] = currentVersion;
    });
    
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
      // Use the highest current version as base and increment
      const nextVersion = getNextAvailableVersion(packages[0].name, originalVersions[packages[0].name], versionType);
      baseVersion = nextVersion;
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
    
    // Track which packages actually need to be published
    const packagesToPublish = [];
    
    // Check for meaningful changes in each package
    for (const pkg of packages) {
      if (!fs.existsSync(path.join(process.cwd(), pkg.path))) {
        console.log(chalk.yellow(`⚠️  Package ${pkg.name} directory not found, skipping...`));
        continue;
      }
      
      if (hasMeaningfulChangesForPublish(pkg.path, pkg.name)) {
        packagesToPublish.push(pkg);
        console.log(chalk.blue(`\n📦 ${pkg.name} has changes, will be published`));
      } else {
        console.log(chalk.gray(`\n⏭️  ${pkg.name} has no meaningful changes, skipping...`));
      }
    }
    
    if (packagesToPublish.length === 0) {
      console.log(chalk.green('\n✅ No packages have meaningful changes. Nothing to publish!'));
      return;
    }
    
    // Update versions, build and publish only packages with changes
    for (const pkg of packagesToPublish) {
      console.log(chalk.blue(`\n📦 Processing ${pkg.name}...`));
      
      // For publish-all, we use the same version for all packages
      const pkgVersion = baseVersion;
      packageVersions[pkg.name] = pkgVersion;
      
      // Fix workspace dependencies before publishing
      fixWorkspaceDependenciesForPublish(pkg.path, packageVersions);
      
      try {
        updateVersion(pkg.path, pkgVersion);
        // Only build if not disabled
        if (!noBuild) {
          buildPackage(pkg);
        }
        
        // Determine tag based on version type and branch
        const tag = (versionType === 'beta' && !isMasterBranch) ? 'beta' : 'latest';
        publishPackage(pkg.path, pkg.name, tag);
        
        // Save the hash after successful publish
        savePackageHashForPublish(pkg.path, pkg.name);
      } finally {
        // Always restore workspace dependencies
        restoreWorkspaceDependenciesAfterPublish(pkg.path);
      }
    }
    
    // Create GitHub release if on master and we actually published something
    if (isMasterBranch && packagesToPublish.length > 0) {
      const tagName = `v${baseVersion}`;
      const releaseNotes = `Release ${baseVersion}

Packages released:
${Object.entries(packageVersions).map(([name, version]) => `- ${name}@${version}`).join('\n')}`;
      createGitHubRelease(tagName, releaseNotes);
    }
    
    console.log(chalk.green(`\n🎉 ${packagesToPublish.length} package(s) published successfully with version ${baseVersion}!`));
    console.log(chalk.cyan('\n📋 Next steps:'));
    console.log(chalk.gray('1. Create a git tag: git tag v' + baseVersion));
    console.log(chalk.gray('2. Push changes: git push && git push --tags'));
  }
}

// Main function
async function main() {
  // Check command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--publish')) {
    // When called with --publish, start the publish process
    console.log(chalk.blue('🏗️  ReactPress Package Builder\n'));
    
    // Show current versions
    console.log(chalk.cyan('📋 Current package versions:'));
    packages.forEach(pkg => {
      const version = getCurrentVersion(pkg.path);
      console.log(chalk.gray(`  ${pkg.name}: ${version}`));
    });
    console.log();
    
    // Start the publish process
    await publishPackages();
  } else if (args.includes('--build')) {
    // When called with --build, just build packages
    await buildPackages();
  } else {
    // Default behavior - show help
    console.log(chalk.blue('🏗️  ReactPress CLI\n'));
    console.log('Usage:');
    console.log('  node scripts/reactpress-cli.js --build    Build all packages');
    console.log('  node scripts/reactpress-cli.js --publish  Publish packages (interactive)');
    console.log('');
  }
}

main().catch(error => {
  console.error(chalk.red('❌ Operation failed:'), error);
  process.exit(1);
});