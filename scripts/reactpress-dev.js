#!/usr/bin/env node
/** @deprecated Use `reactpress dev` */
process.argv = [process.argv[0], process.argv[1], 'dev'];
require('../cli/bin/reactpress');
