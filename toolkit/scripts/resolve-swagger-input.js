const path = require('path');
const { getBundledServerDir, getSwaggerPath } = require('../../cli/lib/paths');

function getSwaggerInputPath() {
  const root = path.resolve(__dirname, '../..');
  return getSwaggerPath(root);
}

function getBundledServerPathForGenerate() {
  return getBundledServerDir();
}

module.exports = { getSwaggerInputPath, getBundledServerPathForGenerate };
