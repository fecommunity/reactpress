const fs = require('fs');
const path = require('path');

function lockFilePath(projectRoot) {
  return path.join(projectRoot, '.reactpress', 'dev-session.json');
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
        await sleep(1200);
        if (isPidAlive(existing.pid)) {
          process.kill(existing.pid, 'SIGKILL');
          await sleep(200);
        }
      } catch {
        // prior session may have exited during signal
      }
      // Do not run `docker compose down` here — DB/nginx containers must survive dev restarts.
    }
  }

  const { releaseStaleDevStackPorts } = require('./ports');
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
