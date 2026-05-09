#!/usr/bin/env node
/** @deprecated Use `reactpress init` */
const force = process.argv.includes('--force');
process.argv = [process.argv[0], process.argv[1], 'init', '.', ...(force ? ['--force'] : [])];
require('../cli/bin/reactpress');
