const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { t, setLocale, getLocale } = require('../lib/i18n');

describe('lib/i18n', () => {
  it('translates known keys in en and zh', () => {
    setLocale('en');
    assert.match(t('cli.description'), /ReactPress/);
    setLocale('zh');
    assert.match(t('cli.description'), /ReactPress/);
    assert.match(t('menu.dev'), /开发|dev/i);
    setLocale('en');
    assert.equal(getLocale(), 'en');
  });

  it('interpolates variables', () => {
    setLocale('en');
    assert.match(t('menu.opening', { url: 'http://x' }), /http:\/\/x/);
  });
});
