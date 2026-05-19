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

  it('skips client build when client/ is missing', () => {
    const root = createStandaloneProject();
    try {
      const inv = resolveBuildInvocation('build:client', root);
      assert.equal(inv, null);
    } finally {
      rmDir(root);
    }
  });

  it('exposes known targets', () => {
    assert.ok(TARGETS.includes('all'));
    assert.ok(TARGETS.includes('toolkit'));
  });
});
