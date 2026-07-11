// @ts-nocheck
const os = require('os');
const chalk = require('chalk');
const {
  brand,
  icon,
  palette,
  visibleLength,
  padRight,
  gradientText,
  macTrafficLights,
  systemStatusBadge,
  statusPill,
  pulseBar,
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

const LOGO_WIDTH = TECH_LOGO[0].length;
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
const CARD_MIN = 68;
const ASCII_CARD_PAD = 8;

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

/** Core dev stack — Docker/Nginx are shown but do not affect the SYSTEM badge. */
const CORE_SYSTEM_SERVICES = new Set(['sqlite', 'mysql', 'server', 'web']);

function deriveSystemState(project, status) {
  const type = project && project.type;
  if (type !== 'monorepo' && type !== 'standalone') {
    return 'pending';
  }
  if (!status || !Array.isArray(status.components) || status.components.length === 0) {
    return 'pending';
  }
  const core = status.components.filter((c) => CORE_SYSTEM_SERVICES.has(c.id));
  if (core.length === 0) return 'pending';
  const okCount = core.filter((c) => c.ok).length;
  if (okCount === core.length) return 'online';
  if (okCount === 0) return 'error';
  return 'partial';
}

function resolveSystemState(options) {
  if (options && options.systemState) return options.systemState;
  if (options && options.status) {
    return deriveSystemState(options.project, options.status);
  }
  const type = options && options.project && options.project.type;
  if (type === 'monorepo' || type === 'standalone') return 'pending';
  return 'pending';
}

function componentLabel(component) {
  return t(`banner.service.${component.id}`).trim();
}

function computeLabelWidth(components) {
  const labels = [
    t('banner.label.mode').trim(),
    t('banner.label.path').trim(),
    ...(components || []).map((c) => componentLabel(c)),
  ];
  return Math.max(...labels.map((label) => visibleLength(label)), 4);
}

function componentStatusPill(component) {
  if (component.ok === 'pending') {
    return statusPill('pending', { pending: t('banner.pulsePending') });
  }
  if (component.id === 'sqlite' || component.id === 'mysql') {
    return statusPill(component.ok, {
      on: t('menu.statusReady'),
      off: t('menu.statusNotReady'),
    });
  }
  if (component.id === 'docker') {
    return statusPill(component.ok, {
      on: t('menu.statusYes'),
      off: t('menu.statusNo'),
    });
  }
  if (component.id === 'nginx') {
    return statusPill(component.ok, {
      on: t('banner.nginxRunning'),
      off: t('banner.nginxStopped'),
    });
  }
  return statusPill(component.ok, {
    on: t('menu.statusOn'),
    off: t('menu.statusOff'),
  });
}

function appendComponentStatusRows(lines, innerWidth, status, lw) {
  if (!status || !Array.isArray(status.components)) return;
  for (const component of status.components) {
    lines.push(
      cardRow(infoRow(componentLabel(component), componentStatusPill(component), lw), innerWidth),
    );
  }
}

function resolveLayout(cols) {
  const showAscii = cols >= LOGO_WIDTH + ASCII_CARD_PAD;
  const width = showAscii
    ? Math.min(cols - 2, Math.max(LOGO_WIDTH + ASCII_CARD_PAD, 88))
    : Math.min(Math.max(CARD_MIN, cols - 4), 88);
  return { showAscii, width };
}

function centerLine(content, innerWidth) {
  const pad = Math.max(0, Math.floor((innerWidth - visibleLength(content)) / 2));
  return ' '.repeat(pad) + content;
}

function renderLogoLines() {
  return TECH_LOGO.map((line, i) => gradientText(line, LOGO_GRADIENTS[i]));
}

function mixHexLocal(a, b, t) {
  const parse = (h) => {
    const s = String(h || '#000000').replace('#', '');
    return {
      r: parseInt(s.substring(0, 2), 16),
      g: parseInt(s.substring(2, 4), 16),
      b: parseInt(s.substring(4, 6), 16),
    };
  };
  const pa = parse(a);
  const pb = parse(b);
  const r = Math.round(pa.r + (pb.r - pa.r) * t);
  const g = Math.round(pa.g + (pb.g - pa.g) * t);
  const bl = Math.round(pa.b + (pb.b - pa.b) * t);
  const pad = (n) => n.toString(16).padStart(2, '0');
  return `#${pad(r)}${pad(g)}${pad(bl)}`;
}

/** Animated logo — horizontal light streak sweeps across ASCII art. */
function renderAnimatedLogoLines(frame = 0, revealRatio = 1) {
  const beamSpeed = 3.6;
  const beamGlow = 16;
  const cycleLen = LOGO_WIDTH + beamGlow * 2;
  const head = (frame * beamSpeed) % cycleLen;
  const trail = (head - beamGlow * 0.75 + cycleLen) % cycleLen;
  const streamHot = '#FFFFFF';
  const streamCore = palette.accent;
  const streamTrail = palette.pink;

  function beamIntensity(col, rowIndex, beamHead) {
    const pos = col + rowIndex * 2.2;
    const raw = Math.abs(pos - beamHead);
    const wrapped = Math.min(raw, cycleLen - raw);
    if (wrapped >= beamGlow) return 0;
    const t = 1 - wrapped / beamGlow;
    return t * t;
  }

  function paintChar(ch, ci, rowIndex, colors, lineLen) {
    if (ch === ' ') return ch;

    const n = Math.max(lineLen - 1, 1);
    const ratio = ci / n;
    const base = mixHexLocal(colors[0], colors[1] || colors[0], ratio);
    const dimBase = mixHexLocal(base, palette.surface, 0.85);

    const primary = beamIntensity(ci, rowIndex, head);
    const secondary = beamIntensity(ci, rowIndex, trail) * 0.55;
    const glow = Math.min(1, primary + secondary);

    if (glow <= 0.03) {
      return chalk.hex(dimBase)(ch);
    }

    let lit = dimBase;
    if (primary > 0.65) {
      lit = mixHexLocal(streamHot, streamCore, 1 - primary);
    } else if (glow > 0.3) {
      lit = mixHexLocal(mixHexLocal(dimBase, streamTrail, 0.15), streamCore, glow);
    } else {
      lit = mixHexLocal(dimBase, streamTrail, glow * 0.9);
    }

    const c = chalk.hex(lit);
    return glow > 0.45 ? c.bold(ch) : c(ch);
  }

  return TECH_LOGO.map((line, rowIndex) => {
    const rowThreshold = (rowIndex + 1) / TECH_LOGO.length;
    if (revealRatio < rowThreshold - 0.06) {
      const ghost = mixHexLocal(palette.border, palette.surface, 0.5);
      return chalk.hex(ghost)(
        [...line]
          .map((ch) => (ch === ' ' ? ch : '░'))
          .join(''),
      );
    }

    const colors = LOGO_GRADIENTS[rowIndex];
    return [...line]
      .map((ch, ci) => paintChar(ch, ci, rowIndex, colors, line.length))
      .join('');
  });
}

function startupPulseRow(innerWidth, { completed = 0, total = 0, ready = false, frame = 0 } = {}) {
  const barWidth = Math.min(24, Math.max(8, innerWidth - 22));
  let filled = 0;
  if (total > 0) {
    filled = Math.round((completed / total) * barWidth);
    if (!ready) filled = Math.min(barWidth, filled + (frame % 2));
  } else {
    filled = 4 + (frame % Math.max(1, barWidth - 4));
  }
  const label = brand.muted(padRight(t('banner.pulseLabel').trim(), 6));
  const bar = pulseBar(barWidth, filled);
  const status = ready
    ? brand.success(t('banner.pulseReady'))
    : brand.warn(t('banner.pulsePending'));
  return centerLine(`${label}${bar}  ${status}`, innerWidth);
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

function titleBarRow(innerWidth, version, systemState) {
  const lights = macTrafficLights() + brand.dim('  ');
  const lightsW = visibleLength(lights);
  const title = brand.dim(`reactpress · v${version}`);
  const titleW = visibleLength(title);
  const status = systemStatusBadge(systemState);
  const statusW = visibleLength(status);

  const titleStart = Math.max(lightsW + 1, Math.floor((innerWidth - titleW) / 2));
  const padBeforeTitle = Math.max(0, titleStart - lightsW);

  let line = lights + ' '.repeat(padBeforeTitle) + title;
  const gap = innerWidth - visibleLength(line) - statusW;
  if (gap >= 2) {
    line += ' '.repeat(gap) + status;
  } else if (gap >= 0) {
    line += ' '.repeat(gap);
  }
  return padRight(line, innerWidth);
}

function repoRow(innerWidth) {
  const link =
    brand.dim(icon.link + ' ') +
    hyperlink(REPO_URL, brand.dim.underline(REPO_DISPLAY));
  return centerLine(link, innerWidth);
}

function headerRows(innerWidth, version, systemState) {
  return [titleBarRow(innerWidth, version, systemState), repoRow(innerWidth)];
}

function wordmarkHero() {
  const bars = brand.border('═══');
  const word = gradientText('REACTPRESS', [palette.pink, palette.primary, palette.accent], {
    bold: true,
  });
  return `${bars} ${word} ${bars}`;
}

/** Compact wordmark with the same streaming-light sweep. */
function renderAnimatedWordmark(frame = 0) {
  const text = 'REACTPRESS';
  const beamSpeed = 3.2;
  const beamGlow = 6;
  const cycleLen = text.length + beamGlow * 2;
  const head = (frame * beamSpeed) % cycleLen;
  const streamHot = '#F0FDFF';

  const bars = brand.border('═══');
  const painted = [...text]
    .map((ch, ci) => {
      const raw = Math.abs(ci + 0.5 - head);
      const wrapped = Math.min(raw, cycleLen - raw);
      const glow = wrapped >= beamGlow ? 0 : Math.pow(1 - wrapped / beamGlow, 2);
      const base = mixHexLocal(palette.pink, palette.accent, ci / Math.max(text.length - 1, 1));
      const dimBase = mixHexLocal(base, palette.surface, 0.65);
      if (glow <= 0.05) return chalk.hex(dimBase).bold(ch);
      const lit =
        glow > 0.75
          ? mixHexLocal(streamHot, palette.accent, 1 - glow)
          : mixHexLocal(dimBase, palette.accent, glow);
      const c = chalk.hex(lit);
      return glow > 0.5 ? c.bold(ch) : c(ch);
    })
    .join('');
  return `${bars} ${painted} ${bars}`;
}

function taglineRow() {
  return `${brand.accent('◇')} ${brand.accent(t('banner.tagline').trim())}`;
}

function softRule(innerWidth) {
  const w = Math.min(innerWidth - 4, Math.max(28, innerWidth - 16));
  return centerLine(brand.border('─'.repeat(w)), innerWidth);
}

function modeChip(type) {
  if (type === 'monorepo') {
    return chalk.bgHex(palette.primary).hex('#0B1220').bold(` ${t('banner.mode.monorepo').trim()} `);
  }
  if (type === 'standalone') {
    return chalk.bgHex(palette.accent).hex('#0B1220').bold(` ${t('banner.mode.standalone').trim()} `);
  }
  return chalk.bgHex(palette.gray).hex('#0B1220').bold(` ${t('banner.mode.uninitialized').trim()} `);
}

function infoRow(label, value, lw) {
  return brand.muted(padRight(label, lw)) + brand.border('│ ') + value;
}

function commandRail() {
  return brand.primary('》 ') + gradientText('init', [palette.primary, palette.accent]);
}

function appendInfoRows(lines, innerWidth, options, lw) {
  if (options.project) {
    lines.push(
      cardRow(infoRow(t('banner.label.mode').trim(), modeChip(options.project.type), lw), innerWidth),
    );
  }
  if (options.projectRoot) {
    const pathValue =
      brand.primary('▶') +
      brand.dim(' ') +
      brand.dim(truncateText(homify(options.projectRoot), innerWidth - lw - 8));
    lines.push(cardRow(infoRow(t('banner.label.path').trim(), pathValue, lw), innerWidth));
  }
  appendComponentStatusRows(lines, innerWidth, options.status, lw);
}

function composeBannerLines(version, options, { showAscii, width, startup } = {}) {
  const innerWidth = width - 4;
  const systemState = startup && !startup.ready ? 'pending' : resolveSystemState(options);
  const components = (options.status && options.status.components) || [];
  const lw = computeLabelWidth(components);
  const lines = [];

  lines.push('');
  lines.push(cardTop(width));
  for (const row of headerRows(innerWidth, version, systemState)) {
    lines.push(cardRow(row, innerWidth));
  }
  lines.push(cardGap(innerWidth));

  if (showAscii) {
    const logoLines =
      startup && !startup.ready
        ? renderAnimatedLogoLines(startup.frame || 0, 1)
        : renderLogoLines();
    for (const logoLine of logoLines) {
      lines.push(cardRow(centerLine(logoLine, innerWidth), innerWidth));
    }
    lines.push(cardGap(innerWidth));
    lines.push(cardRow(centerLine(taglineRow(), innerWidth), innerWidth));
    if (startup && !startup.ready) {
      lines.push(
        cardRow(
          startupPulseRow(innerWidth, {
            completed: startup.completed,
            total: startup.total,
            ready: startup.ready,
            frame: startup.frame || 0,
          }),
          innerWidth,
        ),
      );
    }
  } else {
    const wordmark =
      startup && !startup.ready ? renderAnimatedWordmark(startup.frame || 0) : wordmarkHero();
    lines.push(cardRow(centerLine(wordmark, innerWidth), innerWidth));
    lines.push(cardRow(centerLine(taglineRow(), innerWidth), innerWidth));
    if (startup && !startup.ready) {
      lines.push(
        cardRow(
          startupPulseRow(innerWidth, {
            completed: startup.completed,
            total: startup.total,
            ready: startup.ready,
            frame: startup.frame || 0,
          }),
          innerWidth,
        ),
      );
    }
  }

  lines.push(cardRow(softRule(innerWidth), innerWidth));
  appendInfoRows(lines, innerWidth, options, lw);
  lines.push(cardBottom(width));
  lines.push(`     ${commandRail()}`);
  lines.push('');
  return lines;
}

function printCardBanner(version, options, { showAscii, width, startup } = {}) {
  const lines = composeBannerLines(version, options, { showAscii, width, startup });
  for (const line of lines) console.log(line);
}

function printCompactServiceStatus(status) {
  if (!status || !Array.isArray(status.components)) return;
  const lw = computeLabelWidth(status.components);
  for (const component of status.components) {
    console.log(
      `  ${brand.muted(padRight(componentLabel(component), lw))}${brand.border('│ ')}${componentStatusPill(component)}`,
    );
  }
}

function printCompactBanner(version, options) {
  const systemState = resolveSystemState(options);

  console.log('');
  console.log(
    `  ${macTrafficLights()}  ${brand.dim(`reactpress · v${version}`)}  ${systemStatusBadge(systemState)}`,
  );
  console.log(`  ${brand.muted(icon.link)} ${hyperlink(REPO_URL, brand.dim.underline(REPO_DISPLAY))}`);
  console.log('');
  for (const logoLine of renderLogoLines()) {
    console.log(`  ${logoLine}`);
  }
  console.log(`  ${centerLine(taglineRow(), bannerColumns() - 4)}`);
  if (options.project) console.log(`  ${modeChip(options.project.type)}`);
  if (options.projectRoot) {
    console.log(`  ${brand.primary('▶')} ${brand.dim(homify(options.projectRoot))}`);
  }
  printCompactServiceStatus(options.status);
  console.log(`     ${commandRail()}`);
  console.log('');
}

function printBanner(options = {}) {
  const version = getCliVersion();
  const cols = bannerColumns();
  const { showAscii, width } = resolveLayout(cols);

  if (cols < CARD_MIN) {
    printCompactBanner(version, options);
    return;
  }

  printCardBanner(version, options, { showAscii, width });
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

module.exports = {
  printBanner,
  visibleLength,
  padRight,
  TECH_LOGO,
  LOGO_GRADIENTS,
  LOGO_WIDTH,
  box,
  commandRail,
  renderLogoLines,
  renderAnimatedLogoLines,
  renderAnimatedWordmark,
  composeBannerLines,
  startupPulseRow,
  resolveLayout,
  bannerColumns,
  titleBarRow,
  macTrafficLights,
  deriveSystemState,
  resolveSystemState,
  CORE_SYSTEM_SERVICES,
};
