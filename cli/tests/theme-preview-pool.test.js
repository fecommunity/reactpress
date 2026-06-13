const path = require('path');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { resolvePreviewThemeLaunchPlan } = require('../out/lib/theme-preview-pool');

const HELLO_WORLD = path.join(__dirname, '../../themes/hello-world');
const STARTER = path.join(__dirname, '../../.reactpress/runtime/reactpress-theme-starter');

describe('lib/theme-preview-pool launch plan', () => {
  it('prefers dev script for hello-world (custom server + dev script)', () => {
    const plan = resolvePreviewThemeLaunchPlan(HELLO_WORLD, 3003);
    assert.equal(plan.mode, 'dev');
    assert.equal(plan.cmd, 'pnpm');
    assert.deepEqual(plan.args, ['run', 'dev', '--', '--port', '3003']);
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
