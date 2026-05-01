const { getBundledSwaggerPath, getBundledServerDir } = require('../../server/lib/bundled-server-path');

function getSwaggerInputPath() {
  return getBundledSwaggerPath();
}

function getBundledServerPathForGenerate() {
  return getBundledServerDir();
}

module.exports = { getSwaggerInputPath, getBundledServerPathForGenerate };
