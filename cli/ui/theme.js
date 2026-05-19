const chalk = require('chalk');

/**
 * ReactPress CLI visual identity — a single source of truth so banners,
 * menus, status, doctor, build output all share the same colours and glyphs.
 */
const palette = {
  primary: '#7C5CFF',
  accent: '#22D3EE',
  pink: '#F472B6',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
  gray: '#6B7280',
  dim: '#9CA3AF',
};

const brand = {
  primary: chalk.hex(palette.primary),
  accent: chalk.hex(palette.accent),
  pink: chalk.hex(palette.pink),
  success: chalk.hex(palette.green),
  warn: chalk.hex(palette.amber),
  error: chalk.hex(palette.red),
  muted: chalk.hex(palette.gray),
  dim: chalk.hex(palette.dim),
  bold: chalk.bold,
};

const icon = {
  ok: brand.success('✓'),
  fail: brand.error('✗'),
  warn: brand.warn('⚠'),
  info: brand.accent('ℹ'),
  arrow: brand.primary('›'),
  pointer: brand.primary('▸'),
  bullet: brand.muted('·'),
  dotOn: brand.success('●'),
  dotOff: brand.muted('○'),
  dotPending: brand.warn('◐'),
  dotInfo: brand.accent('●'),
  spark: brand.primary('✱'),
  link: brand.muted('↗'),
};

/**
 * Whether a Unicode code point should occupy two terminal cells.
 *
 * Covers the common "East Asian Wide / Full-width" ranges that show up in
 * Chinese / Japanese / Korean text plus full-width punctuation. We
 * deliberately do not pull in a heavy dependency like `string-width` to keep
 * the CLI's startup cheap.
 */
function isWideCodePoint(cp) {
  return (
    (cp >= 0x1100 && cp <= 0x115f) ||
    (cp >= 0x2e80 && cp <= 0x303e) ||
    (cp >= 0x3041 && cp <= 0x33ff) ||
    (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0x4e00 && cp <= 0x9fff) ||
    (cp >= 0xa000 && cp <= 0xa4cf) ||
    (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xfe30 && cp <= 0xfe4f) ||
    (cp >= 0xff00 && cp <= 0xff60) ||
    (cp >= 0xffe0 && cp <= 0xffe6) ||
    (cp >= 0x1f300 && cp <= 0x1f64f) ||
    (cp >= 0x1f900 && cp <= 0x1f9ff) ||
    (cp >= 0x20000 && cp <= 0x2fffd) ||
    (cp >= 0x30000 && cp <= 0x3fffd)
  );
}

/**
 * Visible terminal-cell width of a string, after stripping ANSI colour codes
 * and accounting for East Asian wide characters (which occupy 2 cells).
 */
function visibleLength(text) {
  const stripped = String(text)
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replace(/\u001b\]8;[^\u0007\u001b]*(?:\u0007|\u001b\\)/g, '');
  let width = 0;
  for (const ch of stripped) {
    const cp = ch.codePointAt(0);
    if (cp === undefined) continue;
    if (cp < 0x20 || (cp >= 0x7f && cp < 0xa0)) continue;
    width += isWideCodePoint(cp) ? 2 : 1;
  }
  return width;
}

function padRight(text, width) {
  const len = visibleLength(text);
  if (len >= width) return text;
  return text + ' '.repeat(width - len);
}

function padLeft(text, width) {
  const len = visibleLength(text);
  if (len >= width) return text;
  return ' '.repeat(width - len) + text;
}

function terminalWidth(fallback = 80) {
  const cols = Number(process.stdout.columns) || fallback;
  return Math.max(48, Math.min(120, cols));
}

function divider(width = 44, char = '─', colorize = brand.muted) {
  return colorize(char.repeat(width));
}

/**
 * Cyberpunk-flavoured progress-bar style decoration.
 * `filled` segments use the primary colour, the trailing track stays muted.
 */
function pulseBar(width = 24, filled = Math.ceil(width * 0.7)) {
  const f = Math.max(0, Math.min(width, filled));
  const head = brand.primary('▰'.repeat(f));
  const tail = brand.muted('▱'.repeat(Math.max(0, width - f)));
  return `${head}${tail}`;
}

/**
 * Three-light status indicator used in the top-right of the banner.
 * Mimics the running-light cluster you'd see on a server rack.
 */
function statusLights(state = 'online') {
  if (state === 'offline') {
    return `${brand.muted('●')} ${brand.muted('●')} ${brand.muted('●')}`;
  }
  if (state === 'pending') {
    return `${brand.warn('●')} ${brand.warn('●')} ${brand.muted('○')}`;
  }
  return `${brand.success('●')} ${brand.warn('●')} ${brand.muted('○')}`;
}

function hex2rgb(h) {
  const s = h.replace('#', '');
  return {
    r: parseInt(s.substring(0, 2), 16),
    g: parseInt(s.substring(2, 4), 16),
    b: parseInt(s.substring(4, 6), 16),
  };
}

function rgb2hex(r, g, b) {
  const pad = (n) => n.toString(16).padStart(2, '0');
  return `#${pad(r)}${pad(g)}${pad(b)}`;
}

function mixHex(a, b, t) {
  const pa = hex2rgb(a);
  const pb = hex2rgb(b);
  const r = Math.round(pa.r + (pb.r - pa.r) * t);
  const g = Math.round(pa.g + (pb.g - pa.g) * t);
  const bl = Math.round(pa.b + (pb.b - pa.b) * t);
  return rgb2hex(r, g, bl);
}

/**
 * Paint a string with a left→right linear gradient across `colors` (hex).
 * Falls back to plain text when stdout does not support truecolor.
 */
function gradientText(text, colors = [palette.primary, palette.accent], { bold = false } = {}) {
  if (!text) return '';
  const supports = chalk.supportsColor && chalk.supportsColor.has16m;
  if (!supports || colors.length < 2) {
    const c = chalk.hex(colors[0] || palette.primary);
    return bold ? c.bold(text) : c(text);
  }
  const chars = [...String(text)];
  const n = Math.max(chars.length - 1, 1);
  return chars
    .map((ch, i) => {
      const ratio = i / n;
      const idx = ratio * (colors.length - 1);
      const lo = Math.floor(idx);
      const hi = Math.min(colors.length - 1, lo + 1);
      const local = idx - lo;
      const c = chalk.hex(mixHex(colors[lo], colors[hi], local));
      return bold ? c.bold(ch) : c(ch);
    })
    .join('');
}

function label(text) {
  return `${icon.arrow} ${brand.primary(text)}`;
}

function ok(text) {
  return `${icon.ok} ${brand.success(text)}`;
}

function fail(text) {
  return `${icon.fail} ${brand.error(text)}`;
}

function warn(text) {
  return `${icon.warn} ${brand.warn(text)}`;
}

function info(text) {
  return `${icon.info} ${brand.accent(text)}`;
}

function chip(text, color = brand.primary) {
  return color(`[ ${text} ]`);
}

function kv(key, value, { keyWidth = 10, valueColor = (s) => s } = {}) {
  return `${brand.muted(padRight(key, keyWidth))}  ${valueColor(value)}`;
}

/**
 * Render a 3-state status pill, e.g. `● online` / `○ offline` / `◐ pending`.
 *
 * @param {boolean | 'pending'} state
 * @param {{ on?: string, off?: string, pending?: string }} labels
 */
function statusPill(state, labels = {}) {
  if (state === 'pending') {
    return `${icon.dotPending} ${brand.warn(labels.pending || 'pending')}`;
  }
  if (state === true) {
    return `${icon.dotOn} ${brand.success(labels.on || 'online')}`;
  }
  return `${icon.dotOff} ${brand.dim(labels.off || 'offline')}`;
}

/**
 * Render a single-line section header: ` ── Title ────────────`.
 */
function sectionHeader(title, { width } = {}) {
  const w = width ?? terminalWidth();
  const prefix = brand.muted('── ');
  const t = brand.bold(brand.primary(title));
  const usedLen = visibleLength(prefix) + visibleLength(t) + 2;
  const fillLen = Math.max(3, w - usedLen - 2);
  const fill = brand.muted('─'.repeat(fillLen));
  return ` ${prefix}${t} ${fill}`;
}

module.exports = {
  palette,
  brand,
  icon,
  label,
  ok,
  fail,
  warn,
  info,
  chip,
  kv,
  statusPill,
  sectionHeader,
  visibleLength,
  padRight,
  padLeft,
  terminalWidth,
  divider,
  gradientText,
  pulseBar,
  statusLights,
};
