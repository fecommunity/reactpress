const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  resolveNginxConfigPath,
  resolveNginxComposeContext,
  ensureNginxConfig,
} = require('../lib/nginx');
const { createStandaloneProject, createMonorepoFixture, rmDir } = require('./helpers/tmp-project');

describe('lib/nginx', () => {
  it('resolves dev config at repo root for monorepo', () => {
    const root = createMonorepoFixture();
    try {
      const configPath = resolveNginxConfigPath(root, 'dev');
      assert.equal(configPath, path.join(root, 'nginx.dev.conf'));
    } finally {
      rmDir(root);
    }
  });

  it('resolves dev config under .reactpress for standalone', () => {
    const root = createStandaloneProject();
    try {
      const configPath = resolveNginxConfigPath(root, 'dev');
      assert.equal(configPath, path.join(root, '.reactpress', 'nginx.dev.conf'));
    } finally {
      rmDir(root);
    }
  });

  it('ensureNginxConfig writes template when missing', () => {
    const root = createStandaloneProject();
    try {
      const target = path.join(root, '.reactpress', 'nginx.dev.conf');
      if (fs.existsSync(target)) fs.unlinkSync(target);
      const { configPath, created } = ensureNginxConfig(root, { mode: 'dev' });
      assert.equal(created, true);
      assert.equal(configPath, target);
      assert.ok(fs.existsSync(target));
      assert.ok(fs.readFileSync(target, 'utf8').includes('host.docker.internal'));
    } finally {
      rmDir(root);
    }
  });

  it('uses docker-compose.dev.yml for monorepo dev nginx', () => {
    const root = createMonorepoFixture();
    try {
      fs.writeFileSync(path.join(root, 'docker-compose.dev.yml'), 'services:\n  nginx:\n    image: nginx\n');
      const ctx = resolveNginxComposeContext(root, 'dev');
      assert.equal(ctx.composeFile, path.join(root, 'docker-compose.dev.yml'));
      assert.equal(ctx.service, 'nginx');
    } finally {
      rmDir(root);
    }
  });
});
