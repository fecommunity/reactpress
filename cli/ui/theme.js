const chalk = require('chalk');

const brand = {
  primary: chalk.hex('#6366f1'),
  accent: chalk.hex('#22d3ee'),
  success: chalk.green,
  warn: chalk.yellow,
  error: chalk.red,
  muted: chalk.gray,
  bold: chalk.bold,
};

function label(text) {
  return brand.primary(`› ${text}`);
}

function ok(text) {
  return brand.success(`✓ ${text}`);
}

function fail(text) {
  return brand.error(`✗ ${text}`);
}

module.exports = { brand, label, ok, fail };
