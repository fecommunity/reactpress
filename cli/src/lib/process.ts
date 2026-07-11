// @ts-nocheck
const fs = require('fs');
const path = require('path');
const { getPidFile, getClientPidFile } = require('./paths');

function readPidFromFile(pidFile) {
  try {
    const raw = fs.readFileSync(pidFile, 'utf8').trim();
    const pid = Number.parseInt(raw, 10);
    return Number.isFinite(pid) ? pid : null;
  } catch {
    return null;
  }
}

function readPid(projectRoot) {
  return readPidFromFile(getPidFile(projectRoot));
}

function readClientPid(projectRoot) {
  return readPidFromFile(getClientPidFile(projectRoot));
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

function clearClientPidFile(projectRoot) {
  const pidFile = getClientPidFile(projectRoot);
  if (fs.existsSync(pidFile)) {
    fs.unlinkSync(pidFile);
  }
}

function writePidToFile(pidFile, pid) {
  fs.mkdirSync(path.dirname(pidFile), { recursive: true });
  fs.writeFileSync(pidFile, String(pid));
}

function writePid(projectRoot, pid) {
  writePidToFile(getPidFile(projectRoot), pid);
}

function writeClientPid(projectRoot, pid) {
  writePidToFile(getClientPidFile(projectRoot), pid);
}

module.exports = {
  readPid,
  readClientPid,
  isProcessRunning,
  clearPidFile,
  clearClientPidFile,
  writePid,
  writeClientPid,
  getPidFile,
  getClientPidFile,
};
