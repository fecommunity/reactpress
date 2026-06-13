// @ts-nocheck
const os = require('os');
const path = require('path');
const chalk = require('chalk');
const {
  brand,
  icon,
  palette,
  visibleLength,
  padRight,
  terminalWidth,
  gradientText,
  pulseBar,
  statusLights,
} = require('./theme');
const { t } = require('../lib/i18n');

/**
 * "REACTPRESS" rendered in the ANSI Shadow font.
 * Each row is exactly 81 single-cell columns, so we can size the surrounding
 * cyber-card deterministically without measuring per-glyph widths.
 */
const TECH_LOGO = [
  '██████╗ ███████╗ █████╗  ██████╗████████╗██████╗ ██████╗ ███████╗███████╗███████╗',
  '██╔══██╗██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝',
  '██████╔╝█████╗  ███████║██║        ██║   ██████╔╝██████╔╝█████╗  ███████╗███████╗',
  '██╔══██╗██╔══╝  ██╔══██║██║        ██║   ██╔═══╝ ██╔══██╗██╔══╝  ╚════██║╚════██║',
  '██║  ██║███████╗██║  ██║╚██████╗   ██║   ██║     ██║  ██║███████╗███████║███████║',
  '╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝',
];

const LOGO_WIDTH = 81;
const LOGO_GRADIENTS = [
  [palette.pink, palette.primary],
  [palette.pink, palette.primary],
  [palette.primary, palette.accent],
  [palette.primary, palette.accent],
  [palette.accent, palette.primary],
  [palette.accent, palette.primary],
];

const REPO_URL = 'https://github.com/fecommunity/reactpress';
/**
 * Shorter, human-friendly form of REPO_URL shown beneath the title bar.
 * The clickable hyperlink still resolves to the full https:// URL via
 * `hyperlink()`, so users can `cmd+click` from any modern terminal.
 */
const REPO_DISPLAY = 'github.com/fecommunity/reactpress';

/**
 * Wrap text in an OSC-8 hyperlink escape so terminals that support it (iTerm2,
 * Warp, WezTerm, modern macOS Terminal, VS Code, GNOME Terminal, Kitty, …)
 * render the label as a clickable link. We only emit the escape sequence when
 * stdout is a real TTY — otherwise (CI logs, file redirects, dumb terminals)
 * we fall back to the plain styled label so users never see the raw `]8;;`.
 */
function hyperlink(url, label) {
  if (!process.stdout.isTTY) return label;
  if (process.env.TERM === 'dumb') return label;
  return `\u001B]8;;${url}\u0007${label}\u001B]8;;\u0007`;
}

function safeReadCliVersion() {
  try {
    return require(path.join(__dirname, '..', 'package.json')).version;
  } catch {
    return 'dev';
  }
}

function homify(p) {
  if (!p) return p;
  const home = os.homedir();
  if (home && p.startsWith(home)) {
    return '~' + p.slice(home.length);
  }
  return p;
}

function renderLogoLines() {
  return TECH_LOGO.map((line, i) => gradientText(line, LOGO_GRADIENTS[i]));
}

function modeChip(type) {
  if (type === 'monorepo') {
    return chalk
      .bgHex(palette.primary)
      .hex('#0B1220')
      .bold(` ${t('banner.mode.monorepo')} `);
  }
  if (type === 'standalone') {
    return chalk
      .bgHex(palette.accent)
      .hex('#0B1220')
      .bold(` ${t('banner.mode.standalone')} `);
  }
  return chalk
    .bgHex(palette.gray)
    .hex('#0B1220')
    .bold(` ${t('banner.mode.uninitialized')} `);
}

/**
 * Decide how "ready" the welcome banner should look. When a fully
 * initialized project is detected we render the pulse bar at 100% and
 * report `ONLINE` status, instead of the static 70% placeholder that used
 * to make `doctor` runs look incomplete even when everything passed.
 */
function bannerReadyState(options) {
  const type = options && options.project && options.project.type;
  if (type === 'monorepo' || type === 'standalone') {
    return { ratio: 1, ready: true };
  }
  return { ratio: 0.4, ready: false };
}

/**
 * Build the top edge of the cyber-card with a centered title block:
 *   ╔══════════[ REACTPRESS · v3.0.3 ]══════════╗
 */
function brandedTopBorder(version, width) {
  const titleBlock =
    brand.primary('[') +
    ' ' +
    gradientText('REACTPRESS', [palette.primary, palette.accent], { bold: true }) +
    ' ' +
    brand.muted('·') +
    ' ' +
    brand.accent(`v${version}`) +
    ' ' +
    brand.primary(']');
  const dashTotal = Math.max(0, width - 2 - visibleLength(titleBlock));
  const left = Math.floor(dashTotal / 2);
  const right = dashTotal - left;
  return (
    brand.primary('╔' + '═'.repeat(left)) +
    titleBlock +
    brand.primary('═'.repeat(right) + '╗')
  );
}

function bottomBorder(width) {
  return brand.primary('╚' + '═'.repeat(width - 2) + '╝');
}

function bodyLine(content, innerWidth) {
  const padded = padRight(content, innerWidth);
  return brand.primary('║ ') + padded + brand.primary(' ║');
}

function emptyBodyLine(innerWidth) {
  return bodyLine('', innerWidth);
}

/**
 * A subtle "CRT scan-line" rendered just under the logo.
 *   ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 */
function scanline(width) {
  return brand.muted('▔'.repeat(width));
}

/**
 * Width of the left-side banner label column.
 *
 * Sized to fit our longest English label (`MODE` / `PATH` → 4 cells)
 * plus a 2-cell trailing gap, which also accommodates the Chinese
 * translations `模式` / `路径` (4 East-Asian cells each).
 */
const LABEL_WIDTH = 6;

/**
 * Centered, dim repo subtitle that sits directly under the top border.
 * Replaces the previous in-body `◇ REPO ↗ …` row, which competed visually
 * with the operational fields (MODE / PATH / pulse) further down.
 */
function repoSubline(innerWidth) {
  const link =
    brand.muted('↗ ') + hyperlink(REPO_URL, brand.accent.underline(REPO_DISPLAY));
  const pad = Math.max(0, Math.floor((innerWidth - visibleLength(link)) / 2));
  return ' '.repeat(pad) + link;
}

/**
 * Single-cell-wide chip label, e.g. `◇ MODE   ▸ monorepo`.
 */
function infoRow(label, value) {
  return (
    brand.accent('◇ ') +
    brand.muted(padRight(label, LABEL_WIDTH)) +
    '  ' +
    brand.primary('▸ ') +
    brand.dim(value)
  );
}

/**
 * Render the "command rail" navigation footer:
 *   ⟫ init   ⟫ dev   ⟫ build   ⟫ deploy   ⟫ publish
 */
function commandRail() {
  const items = ['init', 'dev', 'build', 'deploy', 'publish'];
  return items
    .map(
      (name) =>
        brand.primary('⟫ ') + gradientText(name, [palette.primary, palette.accent])
    )
    .join(brand.muted('   '));
}

/**
 * Wide, full-fat cyber banner: ASCII logo + scan-line + bordered card.
 */
function printWideBanner(version, options) {
  const cols = terminalWidth();
  const cardWidth = Math.min(Math.max(LOGO_WIDTH + 8, 88), cols - 2);
  const innerWidth = cardWidth - 4;

  const lines = [];
  lines.push('');
  lines.push('  ' + brandedTopBorder(version, cardWidth));
  lines.push('  ' + bodyLine(repoSubline(innerWidth), innerWidth));
  lines.push('  ' + emptyBodyLine(innerWidth));

  const logoIndent = Math.max(0, Math.floor((innerWidth - LOGO_WIDTH) / 2));
  const indent = ' '.repeat(logoIndent);
  for (const logoLine of renderLogoLines()) {
    lines.push('  ' + bodyLine(indent + logoLine, innerWidth));
  }

  const scanWidth = Math.min(innerWidth - 2, LOGO_WIDTH);
  const scanIndent = ' '.repeat(Math.max(0, Math.floor((innerWidth - scanWidth) / 2)));
  lines.push('  ' + bodyLine(scanIndent + scanline(scanWidth), innerWidth));

  lines.push('  ' + emptyBodyLine(innerWidth));

  const ready = bannerReadyState(options);
  const subtitle =
    chalk.bold(brand.accent('◆ ')) +
    gradientText(t('banner.subtitle').trim(), [palette.accent, palette.primary, palette.pink], {
      bold: true,
    });
  const stateLabel = ready.ready
    ? brand.success(t('banner.systemOnline').trim())
    : brand.warn(t('banner.systemPending').trim());
  const right =
    statusLights(ready.ready ? 'online' : 'pending') +
    '   ' +
    brand.dim(t('banner.systemLabel').trim() + ' ') +
    stateLabel;
  lines.push('  ' + bodyLine(subtitle + spacer(subtitle, right, innerWidth) + right, innerWidth));

  lines.push('  ' + emptyBodyLine(innerWidth));

  if (options.project) {
    lines.push(
      '  ' +
        bodyLine(
          brand.accent('◇ ') +
            brand.muted(padRight(t('banner.label.mode').trim(), LABEL_WIDTH)) +
            '  ' +
            modeChip(options.project.type),
          innerWidth
        )
    );
  }
  if (options.projectRoot) {
    lines.push(
      '  ' +
        bodyLine(
          infoRow(t('banner.label.path').trim(), homify(options.projectRoot)),
          innerWidth
        )
    );
  }

  const pulseWidth = Math.min(28, innerWidth - 18);
  if (pulseWidth > 8) {
    const filled = Math.max(1, Math.min(pulseWidth, Math.round(pulseWidth * ready.ratio)));
    const pulse = pulseBar(pulseWidth, filled);
    const pulseStatus = ready.ready
      ? t('banner.pulseReady').trim()
      : t('banner.pulsePending').trim();
    const pulseLine =
      brand.accent('◇ ') +
      brand.muted(padRight(t('banner.pulseLabel').trim(), LABEL_WIDTH)) +
      '  ' +
      pulse +
      '  ' +
      (ready.ready ? brand.success(pulseStatus) : brand.warn(pulseStatus));
    lines.push('  ' + bodyLine(pulseLine, innerWidth));
  }

  lines.push('  ' + emptyBodyLine(innerWidth));
  lines.push('  ' + bottomBorder(cardWidth));
  lines.push('     ' + commandRail());
  lines.push('');

  for (const line of lines) console.log(line);
}

/**
 * Pad between a left-aligned and a right-aligned segment so they sit on the
 * same line of the cyber card.
 */
function spacer(left, right, innerWidth) {
  const used = visibleLength(left) + visibleLength(right);
  const gap = Math.max(2, innerWidth - used);
  return ' '.repeat(gap);
}

/**
 * Compact cyber banner for terminals that cannot host the full ASCII logo.
 */
function printCompactBanner(version, options) {
  const cols = terminalWidth();
  const cardWidth = Math.min(cols - 2, 76);
  const innerWidth = cardWidth - 4;

  const lines = [];
  lines.push('');
  lines.push('  ' + brandedTopBorder(version, cardWidth));
  lines.push('  ' + bodyLine(repoSubline(innerWidth), innerWidth));
  lines.push('  ' + emptyBodyLine(innerWidth));

  const ready = bannerReadyState(options);
  const wordmark =
    brand.primary('▌▍▎ ') +
    gradientText('REACTPRESS', [palette.pink, palette.primary, palette.accent], {
      bold: true,
    }) +
    brand.primary(' ▎▍▌');
  const lights = statusLights(ready.ready ? 'online' : 'pending');
  lines.push(
    '  ' + bodyLine(wordmark + spacer(wordmark, lights, innerWidth) + lights, innerWidth)
  );

  const subtitle =
    chalk.bold(brand.accent('◆ ')) + brand.dim(t('banner.subtitle').trim());
  lines.push('  ' + bodyLine(subtitle, innerWidth));
  lines.push('  ' + emptyBodyLine(innerWidth));

  if (options.project) {
    lines.push(
      '  ' +
        bodyLine(
          brand.accent('◇ ') +
            brand.muted(padRight(t('banner.label.mode').trim(), LABEL_WIDTH)) +
            '  ' +
            modeChip(options.project.type),
          innerWidth
        )
    );
  }
  if (options.projectRoot) {
    lines.push(
      '  ' +
        bodyLine(
          infoRow(t('banner.label.path').trim(), homify(options.projectRoot)),
          innerWidth
        )
    );
  }

  lines.push('  ' + emptyBodyLine(innerWidth));
  lines.push('  ' + bottomBorder(cardWidth));
  lines.push('     ' + commandRail());
  lines.push('');

  for (const line of lines) console.log(line);
}

/**
 * Single-line banner for ultra-narrow terminals (CI logs, embedded shells).
 */
function printMinimalBanner(version, options) {
  const ready = bannerReadyState(options);
  const wordmark = gradientText('REACTPRESS', [palette.pink, palette.primary, palette.accent], {
    bold: true,
  });
  console.log('');
  console.log(`  ${brand.primary('▌▍▎')} ${wordmark} ${brand.muted('·')} ${brand.accent(`v${version}`)}  ${statusLights(ready.ready ? 'online' : 'pending')}`);
  console.log(`  ${brand.dim(t('banner.subtitle').trim())}`);
  if (options.project) {
    console.log(`  ${modeChip(options.project.type)}`);
  }
  if (options.projectRoot) {
    console.log(`  ${icon.bullet} ${brand.dim(homify(options.projectRoot))}`);
  }
  console.log(
    `  ${brand.muted('↗')} ${hyperlink(REPO_URL, brand.accent.underline(REPO_URL))}`
  );
  console.log('');
}

/**
 * Print the top-of-screen banner. Adaptive to terminal width: collapses to a
 * single-line greeting on very narrow terminals, otherwise renders a bordered
 * cyber-card with the full ANSI Shadow logo when there is room.
 *
 * @param {{
 *   projectRoot?: string,
 *   project?: { type: string, hasClient: boolean, hasServerSource: boolean }
 * }} [options]
 */
function printBanner(options = {}) {
  const version = safeReadCliVersion();
  const cols = terminalWidth();

  if (cols < 64) {
    printMinimalBanner(version, options);
    return;
  }

  if (cols < LOGO_WIDTH + 10) {
    printCompactBanner(version, options);
    return;
  }

  printWideBanner(version, options);
}

/**
 * Box helper retained for backwards compatibility: a few callers still
 * import `box` from this module to wrap arbitrary multi-line content.
 */
function box(lines, { width } = {}) {
  const innerWidth = width
    ? width - 4
    : lines.reduce((max, line) => Math.max(max, visibleLength(line)), 0);

  const horizontal = '═'.repeat(innerWidth + 2);
  const top = brand.primary(`  ╔${horizontal}╗`);
  const bottom = brand.primary(`  ╚${horizontal}╝`);
  const body = lines.map((line) => {
    const padded = padRight(line, innerWidth);
    return brand.primary('  ║ ') + padded + brand.primary(' ║');
  });
  return [top, ...body, bottom];
}

module.exports = { printBanner, visibleLength, padRight, box };
