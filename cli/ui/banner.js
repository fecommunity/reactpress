const chalk = require('chalk');
const { brand } = require('./theme');
const { getMonorepoRoot } = require('../lib/root');
const path = require('path');

function printBanner() {
  const version = require(path.join(getMonorepoRoot(), 'package.json')).version;
  console.log('');
  console.log(brand.primary('  ╭─────────────────────────────────────────╮'));
  console.log(brand.primary('  │') + chalk.bold.white('   ReactPress') + brand.muted('  ·  全栈发布平台 CLI        ') + brand.primary('│'));
  console.log(brand.primary('  ╰─────────────────────────────────────────╯'));
  console.log(brand.muted(`  v${version}  ·  init · dev · build · deploy · publish`));
  console.log('');
}

module.exports = { printBanner };
