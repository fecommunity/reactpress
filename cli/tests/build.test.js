const fs = require('fs');
const path = require('path');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { resolveBuildInvocation, TARGETS } = require('../lib/build');
const { createMonorepoFixture, createStandaloneProject, rmDir } = require('./helpers/tmp-project');

describe('lib/build', () => {
  it('resolves toolkit build to toolkit/ directory in monorepo', () => {
    const root = createMonorepoFixture();
    try {
      const inv = resolveBuildInvocation('build:toolkit', root);
      assert.ok(inv);
      assert.match(inv.cwd, /toolkit$/);
    } finally {
      rmDir(root);
    }
  });

  it('skips theme build when active theme is missing', () => {
    const root = createStandaloneProject();
    try {
      const inv = resolveBuildInvocation('build:theme', root);
      assert.equal(inv, null);
    } finally {
      rmDir(root);
    }
  });

  it('exposes known targets', () => {
    assert.ok(TARGETS.includes('all'));
    assert.ok(TARGETS.includes('toolkit'));
    assert.ok(TARGETS.includes('web'));
  });

  it('includes web in all steps when web/ exists', () => {
    const root = createMonorepoFixture();
    try {
      fs.mkdirSync(path.join(root, 'web'));
      fs.writeFileSync(
        path.join(root, 'web', 'package.json'),
        JSON.stringify({ name: 'web', scripts: { build: 'echo build' } })
      );
      const { getBuildSteps } = require('../lib/build');
      const steps = getBuildSteps('all', root);
      assert.ok(steps.some((s) => s.script === 'build:web'));
    } finally {
      rmDir(root);
    }
  });
});
