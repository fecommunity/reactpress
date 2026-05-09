#!/usr/bin/env node
/** @deprecated Use `reactpress docker <command>` */
const cmd = process.argv[2] || 'start';
const map = { stop: 'down' };
process.argv = [process.argv[0], process.argv[1], 'docker', map[cmd] || cmd, ...process.argv.slice(3)];
require('../cli/bin/reactpress');
