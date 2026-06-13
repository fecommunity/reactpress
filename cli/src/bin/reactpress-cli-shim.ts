#!/usr/bin/env node
// @ts-nocheck

/**
 * @deprecated 3.0 起请使用 `reactpress`（@fecommunity/reactpress）。3.1 将移除此 bin。
 */
const chalk = require('chalk');
const { t } = require('../lib/i18n');

function mapLegacyArgv(argv) {
  const [cmd, ...rest] = argv;
  if (cmd === 'start') return ['server', 'start', ...rest];
  if (cmd === 'stop') return ['server', 'stop', ...rest];
  if (cmd === 'restart') return ['server', 'restart', ...rest];
  if (cmd === 'status') return ['server', 'status', ...rest];
  return argv;
}

if (!process.env.REACTPRESS_SUPPRESS_DEPRECATION) {
  console.warn(
    chalk.yellow(
      t('shim.deprecated')
    )
  );
}

const mapped = mapLegacyArgv(process.argv.slice(2));
process.argv = [process.argv[0], process.argv[1], ...mapped];
require('./reactpress.js');
