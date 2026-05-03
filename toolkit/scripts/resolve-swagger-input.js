const { getBundledSwaggerPath, getBundledServerDir } = require('../../scripts/bundled-server-path');

function getSwaggerInputPath() {
  return getBundledSwaggerPath();
}

function getBundledServerPathForGenerate() {
  return getBundledServerDir();
}

module.exports = { getSwaggerInputPath, getBundledServerPathForGenerate };
