const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { resolveComposeContext } = require('../out/lib/docker');
const { createStandaloneProject, createMonorepoFixture, rmDir } = require('./helpers/tmp-project');

describe('lib/docker', () => {
  it('uses .reactpress/docker-compose.yml for standalone projects', () => {
    const root = createStandaloneProject();
    try {
      const ctx = resolveComposeContext(root);
      assert.equal(ctx.type, 'standalone');
      assert.ok(ctx.composeFile.endsWith(path.join('.reactpress', 'docker-compose.yml')));
    } finally {
      rmDir(root);
    }
  });

  it('uses docker-compose.dev.yml for monorepo when present', () => {
    const root = createMonorepoFixture();
    try {
      const ctx = resolveComposeContext(root);
      assert.equal(ctx.type, 'monorepo');
    } finally {
      rmDir(root);
    }
  });
});
