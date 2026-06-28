'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  printBanner,
  TECH_LOGO,
  LOGO_WIDTH,
  commandRail,
  renderLogoLines,
  deriveSystemState,
  resolveSystemState,
  resolveLayout,
} = require('../out/ui/banner');
const { systemStatusBadge } = require('../out/ui/theme');

const sampleComponents = [
  { id: 'mysql', ok: false },
  { id: 'server', ok: true },
  { id: 'docker', ok: false },
  { id: 'nginx', ok: false },
  { id: 'web', ok: true },
];

describe('banner', () => {
  it('printBanner renders service rows under PATH', () => {
    const lines = [];
    const origLog = console.log;
    const prevCols = process.stdout.columns;

    console.log = (...args) => lines.push(args.join(' '));
    Object.defineProperty(process.stdout, 'columns', { value: 100, configurable: true });

    try {
      printBanner({
        projectRoot: '/tmp/demo-project',
        project: { type: 'monorepo' },
        systemState: 'partial',
        status: { components: sampleComponents },
      });
    } finally {
      console.log = origLog;
      Object.defineProperty(process.stdout, 'columns', {
        value: prevCols,
        configurable: true,
      });
    }

    const output = lines.join('\n');
    assert.match(output, /██████╗/);
    assert.match(output, /MySQL/);
    assert.match(output, /Server/);
    assert.match(output, /Docker/);
    assert.match(output, /Nginx/);
    assert.match(output, /Web/);
    assert.doesNotMatch(output, /:3000/);
    assert.doesNotMatch(output, /Toolkit/);
  });

  it('deriveSystemState ignores optional docker/nginx for SYSTEM badge', () => {
    const project = { type: 'monorepo' };
    assert.equal(
      deriveSystemState(project, {
        components: [
          { id: 'sqlite', ok: true },
          { id: 'server', ok: true },
          { id: 'docker', ok: false },
          { id: 'nginx', ok: false },
          { id: 'web', ok: true },
        ],
      }),
      'online',
    );
  });

  it('deriveSystemState maps core service checks to four states', () => {
    const project = { type: 'monorepo' };
    assert.equal(deriveSystemState({ type: 'unknown' }, null), 'pending');
    assert.equal(
      deriveSystemState(project, {
        components: [
          { id: 'server', ok: true },
          { id: 'web', ok: true },
        ],
      }),
      'online',
    );
    assert.equal(
      deriveSystemState(project, {
        components: [
          { id: 'server', ok: true },
          { id: 'web', ok: false },
        ],
      }),
      'partial',
    );
    assert.equal(
      deriveSystemState(project, {
        components: [
          { id: 'server', ok: false },
          { id: 'web', ok: false },
        ],
      }),
      'error',
    );
  });

  it('resolveSystemState derives from status when present', () => {
    assert.equal(
      resolveSystemState({
        project: { type: 'monorepo' },
        status: {
          components: [
            { id: 'server', ok: true },
            { id: 'web', ok: true },
          ],
        },
      }),
      'online',
    );
  });

  it('commandRail lists core commands', () => {
    const rail = commandRail();
    assert.match(rail, /init/);
    assert.match(rail, /publish/);
  });
});
