#!/usr/bin/env node
const { runApiDev } = require('./api-dev');
const { ensureOriginalCwd } = require('./root');

ensureOriginalCwd();
runApiDev();
