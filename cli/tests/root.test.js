const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const {
  findProjectRoot,
  isProjectRoot,
  isPublishedCliRoot,
  getMonorepoRoot,
} = require('../lib/root');
const { createStandaloneProject, createMonorepoFixture, rmDir } = require('./helpers/tmp-project');

describe('lib/root', () => {
  it('findProjectRoot discovers standalone .reactpress project', () => {
    const root = createStandaloneProject();
    try {
      assert.equal(findProjectRoot(root), root);
      assert.equal(isProjectRoot(root), true);
    } finally {
      rmDir(root);
    }
  });

  it('isPublishedCliRoot is false for user projects', () => {
    const root = createStandaloneProject();
    try {
      assert.equal(isPublishedCliRoot(root), false);
    } finally {
      rmDir(root);
    }
  });

  it('getMonorepoRoot resolves to repo root in workspace', () => {
    const mono = getMonorepoRoot();
    assert.ok(path.basename(mono) !== 'lib');
  });

  it('findProjectRoot discovers monorepo via pnpm-workspace.yaml', () => {
    const root = createMonorepoFixture();
    try {
      assert.equal(findProjectRoot(root), root);
    } finally {
      rmDir(root);
    }
  });
});
