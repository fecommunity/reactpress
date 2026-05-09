#!/usr/bin/env node
/** @deprecated Use `reactpress publish` */
const args = process.argv.slice(2);
const flag = args.includes('--build') ? '--build' : '--publish';
process.argv = [process.argv[0], process.argv[1], 'publish', flag];
require('../cli/bin/reactpress');
