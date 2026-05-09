#!/usr/bin/env node
/** @deprecated Use `reactpress server start --pm2` */
process.argv = [process.argv[0], process.argv[1], 'server', 'start', '--pm2'];
require('../cli/bin/reactpress');
