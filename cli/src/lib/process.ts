// @ts-nocheck
const fs = require('fs');
const path = require('path');
const { getPidFile } = require('./paths');

function readPid(projectRoot) {
  const pidFile = getPidFile(projectRoot);
  try {
    const raw = fs.readFileSync(pidFile, 'utf8').trim();
    const pid = Number.parseInt(raw, 10);
    return Number.isFinite(pid) ? pid : null;
  } catch {
    return null;
  }
}

function isProcessRunning(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function clearPidFile(projectRoot) {
  const pidFile = getPidFile(projectRoot);
  if (fs.existsSync(pidFile)) {
    fs.unlinkSync(pidFile);
  }
}

function writePid(projectRoot, pid) {
  const pidFile = getPidFile(projectRoot);
  fs.mkdirSync(path.dirname(pidFile), { recursive: true });
  fs.writeFileSync(pidFile, String(pid));
}

module.exports = {
  readPid,
  isProcessRunning,
  clearPidFile,
  writePid,
  getPidFile,
};
