const { STRINGS } = require('./strings');

function resolveLocale() {
  const raw = process.env.REACTPRESS_LANG || process.env.LANG || 'en';
  const code = String(raw).split(/[._-]/)[0].toLowerCase();
  return code === 'zh' ? 'zh' : 'en';
}

let locale = resolveLocale();

/**
 * @param {string} key
 * @param {Record<string, string | number>} [vars]
 */
function t(key, vars = {}) {
  const table = STRINGS[locale] || STRINGS.en;
  let text = table[key] ?? STRINGS.en[key] ?? key;
  if (text == null) {
    text = key == null ? '' : String(key);
  }
  text = String(text);
  for (const [name, value] of Object.entries(vars)) {
    text = text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value ?? ''));
  }
  return text;
}

function getLocale() {
  return locale;
}

function setLocale(next) {
  locale = next === 'zh' ? 'zh' : 'en';
}

module.exports = { t, getLocale, setLocale, resolveLocale };
