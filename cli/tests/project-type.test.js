const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  detectProjectType,
  describeProject,
  hasClient,
} = require('../lib/project-type');
const { createStandaloneProject, createMonorepoFixture, rmDir } = require('./helpers/tmp-project');

describe('lib/project-type', () => {
  it('detects standalone projects', () => {
    const root = createStandaloneProject();
    try {
      assert.equal(detectProjectType(root), 'standalone');
      assert.equal(hasClient(root), false);
    } finally {
      rmDir(root);
    }
  });

  it('detects monorepo checkouts', () => {
    const root = createMonorepoFixture();
    try {
      assert.equal(detectProjectType(root), 'monorepo');
      const info = describeProject(root);
      assert.equal(info.hasClient, true);
      assert.equal(info.hasServerSource, true);
    } finally {
      rmDir(root);
    }
  });
});
