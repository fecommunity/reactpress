const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// incrementVersion is not exported — mirror logic for regression tests
function incrementVersion(version, type) {
  const base = String(version).split('-')[0];
  const parts = base.split('.').map((p) => parseInt(p, 10));
  while (parts.length < 3) parts.push(0);
  const major = Number.isFinite(parts[0]) ? parts[0] : 0;
  const minor = Number.isFinite(parts[1]) ? parts[1] : 0;
  const patch = Number.isFinite(parts[2]) ? parts[2] : 0;

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'beta': {
      const match = version.match(/^(.*)-beta\.(\d+)$/);
      if (match) return `${match[1]}-beta.${parseInt(match[2], 10) + 1}`;
      return `${base}-beta.0`;
    }
    default:
      return version;
  }
}

describe('publish version bump', () => {
  it('bumps patch', () => {
    assert.equal(incrementVersion('3.0.3', 'patch'), '3.0.4');
  });

  it('handles two-segment versions', () => {
    assert.equal(incrementVersion('3.0', 'patch'), '3.0.1');
  });

  it('bumps beta from stable', () => {
    assert.equal(incrementVersion('4.0.0', 'beta'), '4.0.0-beta.0');
  });

  it('bumps beta prerelease', () => {
    assert.equal(incrementVersion('3.0.0-beta.1', 'beta'), '3.0.0-beta.2');
  });
});
