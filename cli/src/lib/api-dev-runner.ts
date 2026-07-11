#!/usr/bin/env node
// @ts-nocheck
const { runApiDev } = require('./api-dev');
const { ensureOriginalCwd } = require('./root');

ensureOriginalCwd();
runApiDev();
