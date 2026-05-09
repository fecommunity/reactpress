#!/usr/bin/env node
/** @deprecated Use `reactpress server <start|stop|restart|status>` */
const cmd = process.argv[2] || 'start';
const map = { 'start:bg': ['server', 'start', '--bg'] };
const extra = map[cmd] || ['server', cmd];
process.argv = [process.argv[0], process.argv[1], ...extra];
require('../cli/bin/reactpress');
