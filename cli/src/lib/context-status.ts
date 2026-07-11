// @ts-nocheck
const fs = require('fs');
const path = require('path');
const { describeProject } = require('./project-type');
const { isDockerRunning } = require('./docker');
const { isNginxContainerRunning } = require('./nginx');
const {
  DEV_PORTS,
  readEnvPort,
  isPortListening,
} = require('./ports');
const {
  loadServerSiteUrl,
  loadWebAdminUrl,
  isHttpResponding,
  checkHealth,
  getHealthUrl,
} = require('./http');

const SERVICE_ORDER = ['sqlite', 'mysql', 'server', 'docker', 'nginx', 'web'];

function parseEnvFile(projectRoot) {
  const envPath = path.join(projectRoot, '.env');
  const env = {};
  try {
    if (!fs.existsSync(envPath)) return env;
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '');
    }
  } catch {
    // ignore
  }
  return env;
}

async function resolveDbType(projectRoot) {
  try {
    const { resolveDatabaseProfile } = require('../core/services/database/profile');
    const profile = await resolveDatabaseProfile(projectRoot);
    return profile.type;
  } catch {
    const env = parseEnvFile(projectRoot);
    if (String(env.DB_TYPE || '').toLowerCase() === 'sqlite') return 'sqlite';
    try {
      const configPath = path.join(projectRoot, '.reactpress/config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.database && config.database.mode === 'embedded-sqlite') return 'sqlite';
      }
    } catch {
      // ignore
    }
    return 'mysql';
  }
}

async function probeMysql(projectRoot) {
  const port = readEnvPort(projectRoot, 'DB_PORT', DEV_PORTS.MYSQL);
  if (isPortListening(port)) return true;
  try {
    const mysql = require('mysql2/promise');
    const env = parseEnvFile(projectRoot);
    const conn = await mysql.createConnection({
      host: env.DB_HOST || '127.0.0.1',
      port: Number(env.DB_PORT || DEV_PORTS.MYSQL),
      user: env.DB_USER || 'reactpress',
      password: env.DB_PASSWD || env.DB_PASSWORD || 'reactpress',
      database: env.DB_DATABASE || 'reactpress',
      connectTimeout: 2000,
    });
    await conn.ping();
    await conn.end();
    return true;
  } catch {
    return false;
  }
}

async function probeSqlite(projectRoot) {
  const { probeSqliteDatabase } = require('../core/services/database/sqlite');
  const result = await probeSqliteDatabase(projectRoot);
  return result.ok;
}

async function probeServer(projectRoot) {
  const port = readEnvPort(projectRoot, 'SERVER_PORT', DEV_PORTS.API);
  if (isPortListening(port)) return true;
  const [httpOk, health] = await Promise.all([
    isHttpResponding(loadServerSiteUrl(projectRoot), 1500),
    checkHealth(getHealthUrl(projectRoot)),
  ]);
  return httpOk || health.ok;
}

async function probeWeb(projectRoot) {
  const port = readEnvPort(projectRoot, 'WEB_ADMIN_PORT', DEV_PORTS.ADMIN_WEB);
  if (isPortListening(port)) return true;
  return isHttpResponding(loadWebAdminUrl(projectRoot), 1500);
}

function resolveServiceChecks(dbType) {
  const dbId = dbType === 'sqlite' ? 'sqlite' : 'mysql';
  return [dbId, 'server', 'docker', 'nginx', 'web'];
}

async function probeService(projectRoot, id) {
  switch (id) {
    case 'sqlite':
      return probeSqlite(projectRoot);
    case 'mysql':
      return probeMysql(projectRoot);
    case 'server':
      return probeServer(projectRoot);
    case 'docker':
      return Promise.resolve(isDockerRunning());
    case 'nginx':
      return Promise.resolve(isNginxContainerRunning());
    case 'web':
      return probeWeb(projectRoot);
    default:
      return false;
  }
}

async function emitProgress(onProgress, payload) {
  if (!onProgress) return;
  onProgress(payload);
  await new Promise((resolve) => setImmediate(resolve));
}

async function fetchContextStatus(projectRoot, { onProgress } = {}) {
  const project = describeProject(projectRoot);
  await emitProgress(onProgress, { phase: 'start', id: '__config' });
  const dbType = await resolveDbType(projectRoot);
  const ids = resolveServiceChecks(dbType);
  await emitProgress(onProgress, { phase: 'ready', total: ids.length + 1 });
  await emitProgress(onProgress, { phase: 'done', id: '__config' });
  const components = await Promise.all(
    ids.map(async (id) => {
      await emitProgress(onProgress, { phase: 'start', id });
      const ok = await probeService(projectRoot, id);
      await emitProgress(onProgress, { phase: 'done', id, ok });
      return { id, ok };
    }),
  );
  return { components, project, dbType };
}

module.exports = {
  fetchContextStatus,
  resolveServiceChecks,
  resolveDbType,
  parseEnvFile,
  probeService,
  SERVICE_ORDER,
};
