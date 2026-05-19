const path = require('path');
const chalk = require('chalk');
const { brand } = require('./theme');
const { t } = require('../lib/i18n');

function safeReadCliVersion() {
  try {
    return require(path.join(__dirname, '..', 'package.json')).version;
  } catch {
    return 'dev';
  }
}

/**
 * Visible length (excluding ANSI escape codes) — needed to align right borders
 * because chalk inserts invisible color codes.
 */
function visibleLength(text) {
  return String(text).replace(/\u001b\[[0-9;]*m/g, '').length;
}

function padRight(text, width) {
  const len = visibleLength(text);
  if (len >= width) return text;
  return text + ' '.repeat(width - len);
}

function box(lines, { width } = {}) {
  const innerWidth = width
    ? width - 4
    : lines.reduce((max, line) => Math.max(max, visibleLength(line)), 0);

  const horizontal = '─'.repeat(innerWidth + 2);
  const top = brand.primary(`  ╭${horizontal}╮`);
  const bottom = brand.primary(`  ╰${horizontal}╯`);
  const body = lines.map((line) => {
    const padded = padRight(line, innerWidth);
    return brand.primary('  │ ') + padded + brand.primary(' │');
  });
  return [top, ...body, bottom];
}

/**
 * @param {{ projectRoot?: string, project?: { type: string, hasClient: boolean, hasServerSource: boolean } }} [options]
 */
function printBanner(options = {}) {
  const version = safeReadCliVersion();
  const title = `${chalk.bold.white('ReactPress')} ${brand.muted(`v${version}`)}`;
  const subtitle = brand.muted(t('banner.subtitle').trim());
  const lines = [title, subtitle];

  if (options.projectRoot) {
    lines.push(brand.muted(`📁 ${options.projectRoot}`));
  }
  if (options.project) {
    const key =
      options.project.type === 'monorepo'
        ? 'menu.contextMonorepo'
        : options.project.type === 'standalone'
          ? 'menu.contextStandalone'
          : 'menu.contextUnknown';
    lines.push(brand.accent(t(key)));
  }

  const minWidth = 56;
  const naturalWidth = Math.max(
    minWidth,
    lines.reduce((max, line) => Math.max(max, visibleLength(line)), 0)
  );
  console.log('');
  for (const line of box(lines, { width: naturalWidth + 4 })) {
    console.log(line);
  }
  console.log(
    brand.muted(`  init · dev · build · deploy · publish`)
  );
  console.log('');
}

module.exports = { printBanner, visibleLength, padRight };
