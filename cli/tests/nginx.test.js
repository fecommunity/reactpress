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
      const content = fs.readFileSync(target, 'utf8');
      assert.ok(content.includes('host.docker.internal'));
      assert.ok(content.includes('host.docker.internal:3000/admin/'));
      assert.ok(!content.includes(':5173'));
      assert.ok(!content.includes('expires 1y'));
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
