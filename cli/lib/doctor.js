const fs = require('fs');
const net = require('net');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const { getHealthUrl, checkHealth } = require('./http');
const { isDockerRunning } = require('./docker');
const { envFileStatus } = require('./status');
const { t } = require('./i18n');

function checkNodeVersion() {
  const major = parseInt(process.versions.node.split('.')[0], 10);
  if (major >= 18) {
    return { ok: true, message: `Node.js ${process.version}` };
  }
  return {
    ok: false,
    message: t('doctor.nodeBad', { version: process.version }),
    fix: t('doctor.nodeFix'),
  };
}

function checkDocker() {
  if (isDockerRunning()) {
    return { ok: true, message: t('doctor.dockerOk') };
  }
  return {
    ok: false,
    message: t('doctor.dockerBad'),
    fix: t('doctor.dockerFix'),
  };
}

function parseEnv(projectRoot) {
  const envPath = path.join(projectRoot, '.env');
  const out = {};
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '');
    }
  } catch {
    // ignore
  }
  return out;
}

function checkPort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
    socket.setTimeout(1000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function checkPorts(projectRoot) {
  const env = parseEnv(projectRoot);
  const apiPort = parseInt(env.SERVER_PORT || '3002', 10);
  const clientPort = parseInt(env.CLIENT_PORT || '3001', 10);
  const [apiBusy, clientBusy] = await Promise.all([checkPort(apiPort), checkPort(clientPort)]);
  const issues = [];
  if (apiBusy) issues.push(t('doctor.portApiBusy', { port: apiPort }));
  if (clientBusy) issues.push(t('doctor.portClientBusy', { port: clientPort }));
  if (issues.length) {
    return {
      ok: false,
      message: issues.join('; '),
      fix: t('doctor.portFix'),
    };
  }
  return {
    ok: true,
    message: t('doctor.portOk', { apiPort, clientPort }),
  };
}

async function checkDatabase(projectRoot) {
  const env = parseEnv(projectRoot);
  const host = env.DB_HOST || '127.0.0.1';
  const port = parseInt(env.DB_PORT || '3306', 10);
  const user = env.DB_USER || 'root';
  const password = env.DB_PASSWD || env.DB_PASSWORD || 'root';
  const database = env.DB_DATABASE || 'reactpress';

  return new Promise((resolve) => {
    let mysql;
    try {
      mysql = require('mysql2/promise');
    } catch {
      try {
        mysql = require(path.join(projectRoot, 'server/node_modules/mysql2/promise'));
      } catch {
        resolve({
          ok: false,
          message: t('doctor.dbNoMysql2'),
          fix: t('doctor.dbMysql2Fix'),
        });
        return;
      }
    }

    mysql
      .createConnection({ host, port, user, password, database, connectTimeout: 5000 })
      .then(async (conn) => {
        await conn.ping();
        await conn.end();
        resolve({
          ok: true,
          message: t('doctor.dbOk', { host, port, database }),
        });
      })
      .catch((err) => {
        resolve({
          ok: false,
          message: t('doctor.dbBad', { error: err.message }),
          fix: t('doctor.dbFix'),
        });
      });
  });
}

async function checkApiHealth(projectRoot) {
  const healthUrl = getHealthUrl(projectRoot);
  const result = await checkHealth(healthUrl);
  if (result.ok) {
    return { ok: true, message: t('doctor.apiOk', { url: healthUrl }) };
  }
  return {
    ok: false,
    message: t('doctor.apiBad', { url: healthUrl }),
    fix: t('doctor.apiFix'),
  };
}

function checkPnpm() {
  try {
    const v = execSync('pnpm -v', { encoding: 'utf8' }).trim();
    return { ok: true, message: `pnpm ${v}` };
  } catch {
    return {
      ok: false,
      message: t('doctor.pnpmBad'),
      fix: t('doctor.pnpmFix'),
    };
  }
}

async function runDoctor(projectRoot) {
  const env = envFileStatus(projectRoot);
  const checks = [
    { name: 'Node.js', run: () => checkNodeVersion() },
    { name: 'pnpm', run: () => checkPnpm() },
    {
      name: t('doctor.check.config'),
      run: () => ({
        ok: env.config,
        message: env.config ? t('doctor.configOk') : t('doctor.configBad'),
        fix: t('doctor.configFix'),
      }),
    },
    {
      name: t('doctor.check.env'),
      run: () => ({
        ok: env.env,
        message: env.env ? t('doctor.envOk') : t('doctor.envBad'),
        fix: t('doctor.envFix'),
      }),
    },
    { name: 'Docker', run: () => checkDocker() },
    { name: t('doctor.check.ports'), run: () => checkPorts(projectRoot) },
    { name: t('doctor.check.database'), run: () => checkDatabase(projectRoot) },
    { name: t('doctor.check.api'), run: () => checkApiHealth(projectRoot) },
  ];

  console.log('');
  console.log(chalk.bold.cyan('  ReactPress Doctor'));
  console.log(chalk.gray(t('doctor.project', { path: projectRoot })));
  console.log(chalk.gray('  ─────────────────────────────────────'));

  let failed = 0;
  for (const { name, run } of checks) {
    const result = await run();
    const icon = result.ok ? chalk.green('✓') : chalk.red('✗');
    console.log(`  ${icon} ${chalk.bold(name)}  ${result.message}`);
    if (!result.ok && result.fix) {
      console.log(chalk.yellow(`      → ${result.fix}`));
      failed += 1;
    } else if (!result.ok) {
      failed += 1;
    }
  }

  console.log(chalk.gray('  ─────────────────────────────────────'));
  if (failed === 0) {
    console.log(chalk.green(t('doctor.allPass')));
  } else {
    console.log(chalk.yellow(t('doctor.failed', { count: failed })));
  }
  console.log('');
  return failed === 0 ? 0 : 1;
}

module.exports = { runDoctor };
