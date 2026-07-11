#!/usr/bin/env node
// @ts-nocheck

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { t } = require('./i18n');
const { getMonorepoRoot } = require('./root');

const SEMVER_RE = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/;
const NPM_REGISTRY = 'https://registry.npmjs.org';

/** Publish order: dependencies first, CLI last. */
const CORE_PUBLISH_PACKAGES = [
  {
    name: '@fecommunity/reactpress-toolkit',
    path: 'toolkit',
    description: 'Official TypeScript SDK — API clients, theme SSR, plugin hooks',
  },
  {
    name: '@fecommunity/reactpress-web',
    path: 'web',
    description: 'Official Admin SPA — WordPress-style writing UI',
  },
  {
    name: '@fecommunity/reactpress-server',
    path: 'server',
    description: t('publish.pkg.server'),
    deprecated: true,
  },
  {
    name: '@fecommunity/reactpress',
    path: 'cli',
    description: 'Publishing platform CLI — CMS, Admin, API, themes in one command',
  },
];

function getWorkspaceRoot() {
  const root = getMonorepoRoot();
  if (fs.existsSync(path.join(root, 'pnpm-workspace.yaml'))) {
    return root;
  }
  return process.cwd();
}

function getCurrentVersion(packagePath) {
  const pkgPath = path.join(getWorkspaceRoot(), packagePath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return pkg.version;
}

function getCanonicalVersion() {
  return getCurrentVersion('cli');
}

function incrementVersion(version, type) {
  const base = String(version).split('-')[0];
  const parts = base.split('.').map((p) => parseInt(p, 10));
  while (parts.length < 3) parts.push(0);
  const major = Number.isFinite(parts[0]) ? parts[0] : 0;
  const minor = Number.isFinite(parts[1]) ? parts[1] : 0;
  const patch = Number.isFinite(parts[2]) ? parts[2] : 0;

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'beta': {
      const match = String(version).match(/^(.*)-beta\.(\d+)$/);
      if (match) return `${match[1]}-beta.${parseInt(match[2], 10) + 1}`;
      return `${base}-beta.0`;
    }
    default:
      return version;
  }
}

function resolveNpmTag(version, explicitTag) {
  if (explicitTag) return explicitTag;
  return String(version).includes('-') ? 'beta' : 'latest';
}

function parseCliPublishOptions(argv = process.argv.slice(2)) {
  const opts = {
    publish: argv.includes('--publish'),
    build: argv.includes('--build'),
    noBuild: argv.includes('--no-build'),
    yes: argv.includes('--yes'),
    tag: undefined,
    version: undefined,
    otp: process.env.NPM_OTP || undefined,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--tag' && argv[i + 1]) opts.tag = argv[++i];
    else if (arg.startsWith('--tag=')) opts.tag = arg.slice('--tag='.length);
    else if (arg === '--version' && argv[i + 1]) opts.version = argv[++i];
    else if (arg.startsWith('--version=')) opts.version = arg.slice('--version='.length);
    else if (arg === '--otp' && argv[i + 1]) opts.otp = argv[++i];
    else if (arg.startsWith('--otp=')) opts.otp = arg.slice('--otp='.length);
  }

  return opts;
}

function printPackageVersions() {
  console.log(chalk.cyan('📋 Package versions:'));
  for (const pkg of CORE_PUBLISH_PACKAGES) {
    console.log(chalk.gray(`  ${pkg.name}: ${getCurrentVersion(pkg.path)}`));
  }
  console.log(chalk.gray(`  reactpress (root): ${getCurrentVersion('.')}`));
  console.log();
}

function checkEnvironment() {
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
  } catch {
    console.log(chalk.red('❌ pnpm is not installed.'));
    return false;
  }

  try {
    execSync(`pnpm whoami --registry ${NPM_REGISTRY}`, { stdio: 'ignore' });
  } catch {
    console.log(
      chalk.red(`❌ Not logged in to npm. Run: pnpm login --registry ${NPM_REGISTRY}`),
    );
    return false;
  }

  return true;
}

function updateVersion(packagePath, newVersion) {
  const root = getWorkspaceRoot();
  const pkgPath = path.join(root, packagePath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const oldVersion = pkg.version;
  pkg.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(chalk.green(`  ✓ ${packagePath}: ${oldVersion} → ${newVersion}`));
}

function syncMonorepoVersions(targetVersion) {
  console.log(chalk.blue(`\n✏️  Syncing version → ${targetVersion}`));
  updateVersion('.', targetVersion);
  for (const pkg of CORE_PUBLISH_PACKAGES) {
    updateVersion(pkg.path, targetVersion);
  }
  const desktopPkg = path.join(getWorkspaceRoot(), 'desktop/package.json');
  if (fs.existsSync(desktopPkg)) {
    updateVersion('desktop', targetVersion);
  }
}

function fixWorkspaceDependenciesForPublish(packagePath, packageVersions) {
  const pkgPath = path.join(getWorkspaceRoot(), packagePath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  for (const depType of ['dependencies', 'devDependencies', 'peerDependencies']) {
    if (!pkg[depType]) continue;
    for (const [depName, depValue] of Object.entries(pkg[depType])) {
      if (!String(depValue).startsWith('workspace:')) continue;
      const depPackage = CORE_PUBLISH_PACKAGES.find((p) => p.name === depName);
      if (depPackage && packageVersions[depName]) {
        pkg[depType][depName] = packageVersions[depName];
      }
    }
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function restoreWorkspaceDependenciesAfterPublish(packagePath, publishedVersion) {
  const pkgPath = path.join(getWorkspaceRoot(), packagePath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  for (const depType of ['dependencies', 'devDependencies', 'peerDependencies']) {
    if (!pkg[depType]) continue;
    for (const [depName, depValue] of Object.entries(pkg[depType])) {
      const depPackage = CORE_PUBLISH_PACKAGES.find((p) => p.name === depName);
      if (depPackage && depValue === publishedVersion) {
        pkg[depType][depName] = 'workspace:*';
      }
    }
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function run(cmd, cwd) {
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function buildAllForPublish() {
  const root = getWorkspaceRoot();
  console.log(chalk.blue('\n🔨 Building publish artifacts...\n'));
  run('pnpm run build', path.join(root, 'toolkit'));
  run('pnpm run build', path.join(root, 'server'));
  run('pnpm run build', path.join(root, 'web'));
  run('node scripts/sync-bundled-core.mjs', path.join(root, 'cli'));
  run('node scripts/sync-monorepo-server.mjs', path.join(root, 'cli'));
  run('node scripts/sync-bundled-toolkit.mjs', path.join(root, 'cli'));
  run('node scripts/patch-bundled-dist.mjs', path.join(root, 'cli'));
  run('node scripts/install-bundled-runtime.mjs', path.join(root, 'cli'));
  run('pnpm run build', path.join(root, 'cli'));
  console.log(chalk.green('\n✅ Build complete\n'));
}

function publishPackage(packagePath, packageName, tag, otp) {
  const otpFlag = otp ? ` --otp ${otp}` : '';
  const cmd = `pnpm publish --access public --tag ${tag} --registry ${NPM_REGISTRY} --no-git-checks${otpFlag}`;
  console.log(chalk.blue(`\n🚀 ${packageName}@${getCurrentVersion(packagePath)} (${tag})`));
  run(cmd, path.join(getWorkspaceRoot(), packagePath));
  console.log(chalk.green(`✅ ${packageName} published`));
}

async function promptPublishPlan(defaults = {}) {
  const current = getCanonicalVersion();
  const { channel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'channel',
      message: 'Release channel:',
      choices: [
        { name: `Beta prerelease (npm tag: beta)`, value: 'beta' },
        { name: `Stable release (npm tag: latest)`, value: 'latest' },
      ],
      default: defaults.tag === 'latest' ? 1 : 0,
    },
  ]);

  const { versionMode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'versionMode',
      message: `Version (current: ${current}):`,
      choices: [
        { name: `Keep ${current}`, value: 'keep' },
        { name: `Bump beta (${incrementVersion(current, 'beta')})`, value: 'beta' },
        { name: `Bump patch (${incrementVersion(current, 'patch')})`, value: 'patch' },
        { name: 'Enter custom version', value: 'custom' },
      ],
    },
  ]);

  let version = current;
  if (versionMode === 'beta' || versionMode === 'patch') {
    version = incrementVersion(current, versionMode);
  } else if (versionMode === 'custom') {
    const { customVersion } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customVersion',
        message: 'Semver version for all core packages:',
        default: current,
        validate: (input) => SEMVER_RE.test(input) || 'Use semver, e.g. 4.0.0-beta.0',
      },
    ]);
    version = customVersion;
  }

  const tag = channel === 'beta' ? 'beta' : resolveNpmTag(version, channel);

  console.log(chalk.cyan(`\nPlan: ${version} → npm tag "${tag}"\n`));
  printPackageVersions();

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Publish all core packages?',
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow('Cancelled.'));
    return null;
  }

  return { version, tag, otp: process.env.NPM_OTP };
}

async function executePublish(plan, options = {}) {
  const { version, tag, otp } = plan;
  const noBuild = options.noBuild === true;

  if (!SEMVER_RE.test(version)) {
    throw new Error(`Invalid semver: ${version}`);
  }

  syncMonorepoVersions(version);

  if (!noBuild) {
    buildAllForPublish();
  }

  const packageVersions = {};
  for (const pkg of CORE_PUBLISH_PACKAGES) {
    packageVersions[pkg.name] = version;
  }

  for (const pkg of CORE_PUBLISH_PACKAGES) {
    fixWorkspaceDependenciesForPublish(pkg.path, packageVersions);
    try {
      publishPackage(pkg.path, pkg.name, tag, otp);
    } finally {
      restoreWorkspaceDependenciesAfterPublish(pkg.path, version);
    }
  }

  console.log(chalk.green(`\n🎉 Published ${CORE_PUBLISH_PACKAGES.length} packages @ ${version} (${tag})`));
  console.log(chalk.cyan('\nVerify:'));
  console.log(chalk.gray(`  npm view @fecommunity/reactpress dist-tags`));
  if (tag === 'beta') {
    console.log(chalk.gray(`  npm i -g @fecommunity/reactpress@beta`));
  } else {
    console.log(chalk.gray(`  npm i -g @fecommunity/reactpress@${version}`));
  }
  console.log(chalk.cyan('\nNext:'));
  console.log(chalk.gray(`  git tag v${version} && git push && git push --tags`));
}

async function buildPackages() {
  console.log(chalk.blue('🏗️  ReactPress publish build\n'));
  printPackageVersions();
  buildAllForPublish();
}

async function publishPackages(cliOptions = {}) {
  console.log(chalk.blue('📦 ReactPress Package Publisher\n'));

  if (!checkEnvironment()) {
    process.exit(1);
  }

  printPackageVersions();

  let plan = null;

  if (cliOptions.version || cliOptions.tag) {
    const version = cliOptions.version || getCanonicalVersion();
    const tag = resolveNpmTag(version, cliOptions.tag);
    plan = { version, tag, otp: cliOptions.otp };

    console.log(chalk.cyan(`Plan: ${version} → npm tag "${tag}"\n`));

    if (!cliOptions.yes) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Publish all core packages?',
          default: false,
        },
      ]);
      if (!confirm) {
        console.log(chalk.yellow('Cancelled.'));
        return;
      }
    }
  } else if (cliOptions.yes) {
    const version = getCanonicalVersion();
    plan = { version, tag: resolveNpmTag(version), otp: cliOptions.otp };
  } else {
    plan = await promptPublishPlan(cliOptions);
    if (!plan) return;
  }

  await executePublish(plan, cliOptions);
}

async function main() {
  const opts = parseCliPublishOptions();

  if (opts.build) {
    await buildPackages();
    return;
  }

  if (opts.publish) {
    await publishPackages(opts);
    return;
  }

  console.log(chalk.blue('📦 ReactPress publish\n'));
  console.log('Usage:');
  console.log('  pnpm run publish:build');
  console.log('  pnpm run publish:packages');
  console.log('');
  console.log('Options:');
  console.log('  --publish              Publish (interactive if no --version/--yes)');
  console.log('  --build                Build publish artifacts only');
  console.log('  --tag beta|latest      npm dist-tag (default: auto from version)');
  console.log('  --version 4.0.0-beta.0  Target semver for all core packages');
  console.log('  --yes                  Skip confirmation');
  console.log('  --no-build             Skip build before publish');
  console.log('  --otp <code>           npm 2FA (or NPM_OTP env)');
  console.log('');
  console.log('Examples:');
  console.log('  NPM_OTP=123456 pnpm run publish:packages -- --yes');
  console.log('  pnpm run publish:packages -- --tag beta --version 4.0.0-beta.0 --yes');
}

module.exports = {
  main,
  buildPackages,
  publishPackages,
  incrementVersion,
  resolveNpmTag,
  CORE_PUBLISH_PACKAGES,
};

if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red('❌ Publish failed:'), error.message || error);
    process.exit(1);
  });
}
