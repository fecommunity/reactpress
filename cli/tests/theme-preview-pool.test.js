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

  it('uses dev script for reactpress-theme-starter', () => {
    const plan = resolvePreviewThemeLaunchPlan(STARTER, 3003);
    assert.equal(plan.mode, 'dev');
    assert.equal(plan.cmd, 'pnpm');
  });
});
