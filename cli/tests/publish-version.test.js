const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { incrementVersion, promoteToStable, resolveNpmTag, CORE_PUBLISH_PACKAGES } = require('../out/lib/publish');

const REPO_ROOT = path.join(__dirname, '..', '..');

describe('publish version bump', () => {
  it('bumps patch', () => {
    assert.equal(incrementVersion('3.0.3', 'patch'), '3.0.4');
  });

  it('handles two-segment versions', () => {
    assert.equal(incrementVersion('3.0', 'patch'), '3.0.1');
  });

  it('bumps beta from stable', () => {
    assert.equal(incrementVersion('4.0.0', 'beta'), '4.0.0-beta.0');
  });

  it('bumps beta prerelease', () => {
    assert.equal(incrementVersion('3.0.0-beta.1', 'beta'), '3.0.0-beta.2');
  });

  it('promotes beta to stable without bumping patch', () => {
    assert.equal(promoteToStable('4.0.0-beta.18'), '4.0.0');
    assert.equal(incrementVersion('4.0.0-beta.18', 'stable'), '4.0.0');
  });

  it('promoteToStable is a no-op for already-stable versions', () => {
    assert.equal(promoteToStable('4.0.0'), '4.0.0');
    assert.equal(incrementVersion('4.0.0', 'stable'), '4.0.0');
  });
});

describe('resolveNpmTag for stable promotion', () => {
  it('maps stable semver to latest by default', () => {
    assert.equal(resolveNpmTag('4.0.0'), 'latest');
  });

  it('maps prerelease semver to beta by default', () => {
    assert.equal(resolveNpmTag('4.0.0-beta.18'), 'beta');
  });

  it('honors explicit tag override', () => {
    assert.equal(resolveNpmTag('4.0.0-beta.18', 'latest'), 'latest');
    assert.equal(resolveNpmTag('4.0.0', 'beta'), 'beta');
  });
});

describe('4.0.0 stable release consistency', () => {
  it('keeps core package versions aligned at 4.0.0 without prerelease', () => {
    const versions = new Map();
    for (const pkg of CORE_PUBLISH_PACKAGES) {
      const pkgJson = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, pkg.path, 'package.json'), 'utf8'));
      versions.set(pkg.name, pkgJson.version);
      assert.equal(pkgJson.version, '4.0.0', `${pkg.name} must be 4.0.0 for stable @latest`);
      assert.equal(pkgJson.version.includes('-'), false, `${pkg.name} must not carry a prerelease suffix`);
    }

    const rootVersion = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8')).version;
    const desktopVersion = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'desktop/package.json'), 'utf8')).version;

    assert.equal(rootVersion, '4.0.0');
    assert.equal(desktopVersion, '4.0.0');
    assert.equal(versions.get('@fecommunity/reactpress'), '4.0.0');
  });

  it('defaults docs install helpers to latest / 4.0.0', () => {
    const packageVersions = fs.readFileSync(path.join(REPO_ROOT, 'docs/src/npm/packageVersions.ts'), 'utf8');
    assert.match(packageVersions, /latest:\s*'4\.0\.0'/);
    assert.match(packageVersions, /buildInstallCommand\(tag:\s*'beta'\s*\|\s*'latest'\s*=\s*'latest'\)/);

    const quickStart = fs.readFileSync(path.join(REPO_ROOT, 'docs/src/constants/quickStartCommands.ts'), 'utf8');
    assert.match(quickStart, /buildInstallCommand\('latest'\)/);
  });
});
