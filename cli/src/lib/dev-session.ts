// @ts-nocheck
const fs = require('fs');
const path = require('path');

function lockFilePath(projectRoot) {
  const { devSessionSuffix } = require('./ports');
  return path.join(projectRoot, '.reactpress', `dev-session${devSessionSuffix()}.json`);
}

function isPidAlive(pid) {
  const n = parseInt(pid, 10);
  if (!Number.isFinite(n) || n <= 0) return false;
  try {
    process.kill(n, 0);
    return true;
  } catch {
    return false;
  }
}

function readDevSession(projectRoot) {
  try {
    return JSON.parse(fs.readFileSync(lockFilePath(projectRoot), 'utf8'));
  } catch {
    return null;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ensure a single `reactpress dev` owner per project directory.
 * Stops a stale lock holder from a crashed prior run when its PID is gone,
 * or signals a still-running prior session before taking over ports.
 */
async function acquireDevSession(projectRoot) {
  const resolvedRoot = path.resolve(projectRoot);
  const lockPath = lockFilePath(resolvedRoot);
  const existing = readDevSession(resolvedRoot);

  if (existing?.pid && existing.pid !== process.pid) {
    if (isPidAlive(existing.pid)) {
      console.warn(
        `[reactpress] Replacing dev session pid ${existing.pid} (started ${existing.startedAt || 'unknown'})`,
      );
      try {
        process.kill(existing.pid, 'SIGTERM');
      } catch {
        // prior session may have exited during signal
      }
      await sleep(400);
      if (isPidAlive(existing.pid)) {
        try {
          process.kill(existing.pid, 'SIGKILL');
        } catch {
          // ignore
        }
        await sleep(200);
      }
      // Do not run `docker compose down` here — DB/nginx containers must survive dev restarts.
    }
  }

  const {
    releaseStaleDevStackPorts,
    resolveDevStackPorts,
    applyDevStackPortsToEnv,
    readInstanceIndex,
  } = require('./ports');
  const stack = resolveDevStackPorts(resolvedRoot);
  applyDevStackPortsToEnv(stack);
  const instance = stack.admin !== 3000 || stack.api !== 3002 ? readInstanceIndex() : 0;
  if (instance > 0) {
    console.log(
      `[reactpress] Dev instance ${instance} — admin :${stack.admin}, api :${stack.api}, visitor :${stack.visitor}, preview :${stack.preview}`,
    );
  }
  await releaseStaleDevStackPorts(resolvedRoot);

  fs.mkdirSync(path.dirname(lockPath), { recursive: true });
  fs.writeFileSync(
    lockPath,
    `${JSON.stringify(
      {
        pid: process.pid,
        ppid: process.ppid,
        startedAt: new Date().toISOString(),
        projectRoot: resolvedRoot,
      },
      null,
      2,
    )}\n`,
  );
}

function releaseDevSession(projectRoot) {
  try {
    const existing = readDevSession(projectRoot);
    if (existing?.pid === process.pid) {
      fs.unlinkSync(lockFilePath(projectRoot));
    }
  } catch {
    // ignore
  }
}

function isDevSessionOwner(projectRoot) {
  const existing = readDevSession(projectRoot);
  return !existing?.pid || existing.pid === process.pid;
}

module.exports = {
  acquireDevSession,
  releaseDevSession,
  readDevSession,
  isDevSessionOwner,
  isPidAlive,
};
