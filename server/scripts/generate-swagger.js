#!/usr/bin/env node

const { execSync } = require('child_process');
const { getBundledServerDir } = require('../lib/bundled-server-path');

execSync('npm run generate:swagger', {
  cwd: getBundledServerDir(),
  stdio: 'inherit',
});
