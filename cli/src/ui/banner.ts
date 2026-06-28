// @ts-nocheck
const os = require('os');
const chalk = require('chalk');
const {
  brand,
  icon,
  palette,
  badge,
  visibleLength,
  padRight,
  gradientText,
  pulseBar,
  statusLights,
} = require('./theme');
const { t } = require('../lib/i18n');
const { getCliVersion } = require('../lib/paths');

/** Full ANSI Shadow logo — 81 cells wide. */
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
const REPO_DISPLAY = 'github.com/fecommunity/reactpress';

const LABEL_WIDTH = 6;
const FEAT_COLORS = [palette.accent, palette.primary, palette.pink, palette.accent];

function hyperlink(url, label) {
  if (!process.stdout.isTTY) return label;
  if (process.env.TERM === 'dumb') return label;
  return `\u001B]8;;${url}\u0007${label}\u001B]8;;\u0007`;
}

function homify(p) {
  if (!p) return p;
  const home = os.homedir();
  if (home && p.startsWith(home)) return '~' + p.slice(home.length);
  return p;
}

function truncateText(text, maxLen) {
  const raw = String(text);
  if (visibleLength(raw) <= maxLen) return raw;
  if (maxLen <= 3) return '…';
  let out = '…';
  for (let i = raw.length - 1; i >= 0; i -= 1) {
    const candidate = '…' + raw.slice(i);
    if (visibleLength(candidate) <= maxLen) {
      out = candidate;
      break;
    }
  }
  return out;
}

function bannerColumns() {
  const raw = Number(process.stdout.columns);
  return raw >= 48 ? raw : 80;
}

function bannerReadyState(options) {
  const type = options && options.project && options.project.type;
  if (type === 'monorepo' || type === 'standalone') {
    return { ratio: 1, ready: true };
  }
  return { ratio: 0.4, ready: false };
}

function renderLogoLines() {
  return TECH_LOGO.map((line, i) => gradientText(line, LOGO_GRADIENTS[i]));
}

function renderWordmarkHero() {
  const bar = brand.border('── ');
  const word = gradientText('REACTPRESS', [palette.pink, palette.primary, palette.accent], {
    bold: true,
  });
  return bar + word + brand.border(' ──');
}

function cardTop(width) {
  return brand.border(`  ╭${'─'.repeat(width - 2)}╮`);
}

function cardBottom(width) {
  return brand.border(`  ╰${'─'.repeat(width - 2)}╯`);
}

function cardRow(content, innerWidth) {
  const padded = padRight(content, innerWidth);
  return brand.border('  │ ') + padded + brand.border(' │');
}

function cardGap(innerWidth) {
  return cardRow('', innerWidth);
}

function centerLine(content, innerWidth) {
  const pad = Math.max(0, Math.floor((innerWidth - visibleLength(content)) / 2));
  return ' '.repeat(pad) + content;
}

function spacer(left, right, innerWidth) {
  const used = visibleLength(left) + visibleLength(right);
  const gap = Math.max(2, innerWidth - used);
  return ' '.repeat(gap);
}

function titleLine(version, innerWidth) {
  const text =
    gradientText('REACTPRESS', [palette.primary, palette.accent], { bold: true }) +
    brand.dim('  ·  ') +
    brand.accent(`v${version}`);
  return centerLine(text, innerWidth);
}

function repoLine(innerWidth) {
  const link = brand.dim('↗ ') + hyperlink(REPO_URL, brand.dim.underline(REPO_DISPLAY));
  return centerLine(link, innerWidth);
}

function featureBadges(innerWidth) {
  const keys = [
    'banner.feat.sqlite',
    'banner.feat.plugins',
    'banner.feat.desktop',
    'banner.feat.themes',
  ];
  const items = keys.map((key, i) => badge(t(key).trim(), FEAT_COLORS[i % FEAT_COLORS.length]));
  const joined = items.join(brand.dim('  '));
  if (visibleLength(joined) <= innerWidth) {
    return centerLine(joined, innerWidth);
  }
  // Narrow: drop to simple dot-separated labels
  const plain = keys
    .map((key) => brand.accent(t(key).trim()))
    .join(brand.dim(' · '));
  return centerLine(plain, innerWidth);
}

function taglineRow(ready, innerWidth) {
  const left = brand.dim(t('banner.subtitle').trim());
  const status = ready.ready
    ? brand.success(t('banner.pulseReady').trim())
    : brand.warn(t('banner.pulsePending').trim());
  const right = `${statusLights(ready.ready ? 'online' : 'pending')}  ${status}`;
  return left + spacer(left, right, innerWidth) + right;
}

function softRule(innerWidth) {
  const w = Math.min(innerWidth - 4, Math.max(24, innerWidth - 12));
  const rule = brand.border('─'.repeat(w));
  return centerLine(rule, innerWidth);
}

function modeChip(type) {
  if (type === 'monorepo') {
    return chalk.bgHex(palette.primary).hex('#0B1220').bold(` ${t('banner.mode.monorepo')} `);
  }
  if (type === 'standalone') {
    return chalk.bgHex(palette.accent).hex('#0B1220').bold(` ${t('banner.mode.standalone')} `);
  }
  return chalk.bgHex(palette.gray).hex('#0B1220').bold(` ${t('banner.mode.uninitialized')} `);
}

function infoRow(label, value) {
  return (
    brand.dim('  ') +
    brand.muted(padRight(label, LABEL_WIDTH)) +
    brand.dim('│ ') +
    brand.dim(value)
  );
}

function setupRow(ready, innerWidth, pulseMax) {
  if (ready.ready) return null;
  const pulseWidth = Math.min(pulseMax, innerWidth - LABEL_WIDTH - 12);
  if (pulseWidth <= 8) return null;
  const filled = Math.max(1, Math.round(pulseWidth * ready.ratio));
  const pulse = pulseBar(pulseWidth, filled);
  const status = brand.warn(t('banner.pulsePending').trim());
  return (
    brand.dim('  ') +
    brand.muted(padRight(t('banner.pulseLabel').trim(), LABEL_WIDTH)) +
    brand.dim('│ ') +
    pulse +
    '  ' +
    status
  );
}

function commandRail() {
  const items = ['init', 'dev', 'build', 'deploy', 'publish'];
  return items
    .map((name) => brand.primary('› ') + gradientText(name, [palette.primary, palette.accent]))
    .join(brand.dim('   '));
}

function appendMetaBlock(lines, innerWidth, options, ready, pulseMax) {
  lines.push(cardRow(taglineRow(ready, innerWidth), innerWidth));
  lines.push(cardRow(featureBadges(innerWidth), innerWidth));
  lines.push(cardRow(softRule(innerWidth), innerWidth));

  if (options.project) {
    const modeLine =
      brand.dim('  ') +
      brand.muted(padRight(t('banner.label.mode').trim(), LABEL_WIDTH)) +
      brand.dim('│ ') +
      modeChip(options.project.type);
    lines.push(cardRow(modeLine, innerWidth));
  }
  if (options.projectRoot) {
    const pathValue = truncateText(homify(options.projectRoot), innerWidth - LABEL_WIDTH - 6);
    lines.push(cardRow(infoRow(t('banner.label.path').trim(), pathValue), innerWidth));
  }

  const setup = setupRow(ready, innerWidth, pulseMax);
  if (setup) {
    lines.push(cardRow(setup, innerWidth));
  }
}

function printCardBanner(version, options, { logoLines, cardWidth, pulseMax }) {
  const innerWidth = cardWidth - 4;
  const ready = bannerReadyState(options);
  const lines = [];

  lines.push('');
  lines.push(cardTop(cardWidth));
  lines.push(cardRow(titleLine(version, innerWidth), innerWidth));
  lines.push(cardRow(repoLine(innerWidth), innerWidth));
  lines.push(cardGap(innerWidth));

  const logoWidth = logoLines.reduce(
    (max, line) => Math.max(max, visibleLength(line)),
    0,
  );
  const logoIndent = Math.max(0, Math.floor((innerWidth - logoWidth) / 2));
  const indent = ' '.repeat(logoIndent);
  for (const logoLine of logoLines) {
    lines.push(cardRow(indent + logoLine, innerWidth));
  }

  lines.push(cardGap(innerWidth));
  appendMetaBlock(lines, innerWidth, options, ready, pulseMax);
  lines.push(cardGap(innerWidth));
  lines.push(cardBottom(cardWidth));
  lines.push('     ' + commandRail());
  lines.push('');

  for (const line of lines) console.log(line);
}

function printWideBanner(version, options) {
  const cols = bannerColumns();
  const cardWidth = Math.min(Math.max(LOGO_WIDTH + 8, 88), cols - 2);
  printCardBanner(version, options, {
    logoLines: renderLogoLines(),
    cardWidth,
    pulseMax: 24,
  });
}

function printCompactBanner(version, options) {
  const cols = bannerColumns();
  const cardWidth = Math.min(Math.max(cols - 2, 72), 88);
  printCardBanner(version, options, {
    logoLines: [renderWordmarkHero()],
    cardWidth,
    pulseMax: 18,
  });
}

function printMinimalBanner(version, options) {
  const ready = bannerReadyState(options);
  const wordmark = gradientText('REACTPRESS', [palette.pink, palette.primary, palette.accent], {
    bold: true,
  });
  console.log('');
  console.log(
    `  ${wordmark} ${brand.dim('·')} ${brand.accent(`v${version}`)}  ${statusLights(ready.ready ? 'online' : 'pending')}`,
  );
  console.log(`  ${brand.dim(t('banner.subtitle').trim())}`);
  console.log(`  ${featureBadges(64)}`);
  if (options.project) console.log(`  ${modeChip(options.project.type)}`);
  if (options.projectRoot) {
    console.log(`  ${icon.bullet} ${brand.dim(homify(options.projectRoot))}`);
  }
  console.log(`  ${brand.muted('↗')} ${hyperlink(REPO_URL, brand.accent.underline(REPO_DISPLAY))}`);
  console.log('');
}

function printBanner(options = {}) {
  const version = getCliVersion();
  const cols = bannerColumns();

  if (cols < 60) {
    printMinimalBanner(version, options);
    return;
  }

  if (cols < LOGO_WIDTH + 10) {
    printCompactBanner(version, options);
    return;
  }

  printWideBanner(version, options);
}

function box(lines, { width } = {}) {
  const innerWidth = width
    ? width - 4
    : lines.reduce((max, line) => Math.max(max, visibleLength(line)), 0);

  const horizontal = '─'.repeat(innerWidth + 2);
  const top = brand.border(`  ╭${horizontal}╮`);
  const bottom = brand.border(`  ╰${horizontal}╯`);
  const body = lines.map((line) => {
    const padded = padRight(line, innerWidth);
    return brand.border('  │ ') + padded + brand.border(' │');
  });
  return [top, ...body, bottom];
}

module.exports = { printBanner, visibleLength, padRight, box };
