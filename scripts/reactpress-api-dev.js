#!/usr/bin/env node
/** @deprecated Use `reactpress dev --api-only` */
process.argv = [process.argv[0], process.argv[1], 'dev', '--api-only'];
require('../cli/bin/reactpress');
