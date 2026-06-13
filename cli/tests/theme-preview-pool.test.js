const path = require('path');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { resolvePreviewThemeLaunchPlan } = require('../out/lib/theme-preview-pool');

const HELLO_WORLD = path.join(__dirname, '../../themes/hello-world');
const STARTER = path.join(__dirname, '../../.reactpress/runtime/reactpress-theme-starter');

describe('lib/theme-preview-pool launch plan', () => {
  it('prefers dev script for hello-world outside integrated desktop dev', () => {
    const prev = process.env.REACTPRESS_DESKTOP_LOCAL;
    delete process.env.REACTPRESS_DESKTOP_LOCAL;
    delete process.env.REACTPRESS_DESKTOP_SITE_ROOT;
    try {
      const plan = resolvePreviewThemeLaunchPlan(HELLO_WORLD, 3003);
      assert.equal(plan.mode, 'dev');
      assert.equal(plan.cmd, 'pnpm');
      assert.deepEqual(plan.args, ['run', 'dev', '--', '--port', '3003']);
    } finally {
      if (prev === undefined) delete process.env.REACTPRESS_DESKTOP_LOCAL;
      else process.env.REACTPRESS_DESKTOP_LOCAL = prev;
    }
  });

  it('uses production custom server for hello-world in dev:web:local stack', () => {
    const prevLocal = process.env.REACTPRESS_DESKTOP_LOCAL;
    const prevSite = process.env.REACTPRESS_DESKTOP_SITE_ROOT;
    process.env.REACTPRESS_DESKTOP_LOCAL = '1';
    try {
      const plan = resolvePreviewThemeLaunchPlan(HELLO_WORLD, 3003);
      assert.equal(plan.mode, 'production');
      assert.equal(plan.cmd, 'node');
      assert.deepEqual(plan.args, ['server.js']);
    } finally {
      if (prevLocal === undefined) delete process.env.REACTPRESS_DESKTOP_LOCAL;
      else process.env.REACTPRESS_DESKTOP_LOCAL = prevLocal;
      if (prevSite === undefined) delete process.env.REACTPRESS_DESKTOP_SITE_ROOT;
      else process.env.REACTPRESS_DESKTOP_SITE_ROOT = prevSite;
    }
  });

  it('uses production launch for App Router reactpress-theme-starter (fast switch when pre-built)', () => {
    const plan = resolvePreviewThemeLaunchPlan(STARTER, 3003);
    assert.equal(plan.mode, 'production');
    assert.equal(plan.cmd, process.execPath);
    assert.match(plan.args.join(' '), /next/);
  });

  it('allows admin iframe when REACTPRESS_DESKTOP_LOCAL is set', () => {
    const { shouldHonorThemePreviewFrame } = require('../out/lib/theme-preview-pool');
    const prev = process.env.REACTPRESS_DESKTOP_LOCAL;
    process.env.REACTPRESS_DESKTOP_LOCAL = '1';
    try {
      assert.equal(shouldHonorThemePreviewFrame(), true);
    } finally {
      if (prev === undefined) delete process.env.REACTPRESS_DESKTOP_LOCAL;
      else process.env.REACTPRESS_DESKTOP_LOCAL = prev;
    }
  });
});
