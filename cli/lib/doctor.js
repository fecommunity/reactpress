const fs = require('fs');
const http = require('http');
const net = require('net');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const { loadServerSiteUrl, getHealthUrl, checkHealth } = require('./http');
const { isDockerRunning } = require('./docker');
const { envFileStatus } = require('./status');

function checkNodeVersion() {
  const major = parseInt(process.versions.node.split('.')[0], 10);
  if (major >= 18) {
    return { ok: true, message: `Node.js ${process.version}` };
  }
  return {
    ok: false,
    message: `Node.js ${process.version}（需要 ≥ 18）`,
    fix: '请安装 Node.js 18+：https://nodejs.org/',
  };
}

function checkDocker() {
  if (isDockerRunning()) {
    return { ok: true, message: 'Docker 引擎可用' };
  }
  return {
    ok: false,
    message: 'Docker 未运行或不可用',
    fix:
      '安装并启动 Docker：https://docs.docker.com/get-docker/ ，然后运行 reactpress docker up；或改 config.json 使用外部 MySQL',
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
  if (apiBusy) issues.push(`API 端口 ${apiPort} 已被占用`);
  if (clientBusy) issues.push(`前端端口 ${clientPort} 已被占用`);
  if (issues.length) {
    return {
      ok: false,
      message: issues.join('；'),
      fix: '修改 .env 中 SERVER_PORT / CLIENT_PORT，或停止占用进程',
    };
  }
  return { ok: true, message: `端口 ${apiPort}（API）、${clientPort}（前端）可用` };
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
          message: '未安装 mysql2，无法检测数据库',
          fix: '在 monorepo 根目录执行 pnpm install',
        });
        return;
      }
    }

    mysql
      .createConnection({ host, port, user, password, database, connectTimeout: 5000 })
      .then(async (conn) => {
        await conn.ping();
        await conn.end();
        resolve({ ok: true, message: `MySQL ${host}:${port}/${database} 连通` });
      })
      .catch((err) => {
        resolve({
          ok: false,
          message: `数据库连接失败: ${err.message}`,
          fix: '运行 reactpress docker up 或检查 .env 中 DB_* 配置',
        });
      });
  });
}

async function checkApiHealth(projectRoot) {
  const healthUrl = getHealthUrl(projectRoot);
  const result = await checkHealth(healthUrl);
  if (result.ok) {
    return { ok: true, message: `API 健康检查通过 (${healthUrl})` };
  }
  return {
    ok: false,
    message: `API 未响应健康检查 (${healthUrl})`,
    fix: '运行 reactpress server start 或 reactpress dev',
  };
}

function checkPnpm() {
  try {
    const v = execSync('pnpm -v', { encoding: 'utf8' }).trim();
    return { ok: true, message: `pnpm ${v}` };
  } catch {
    return {
      ok: false,
      message: '未检测到 pnpm',
      fix: 'npm i -g pnpm，或在 monorepo 根目录使用 corepack enable',
    };
  }
}

async function runDoctor(projectRoot) {
  const env = envFileStatus(projectRoot);
  const checks = [
    { name: 'Node.js', run: () => checkNodeVersion() },
    { name: 'pnpm', run: () => checkPnpm() },
    { name: '配置文件', run: () => ({
      ok: env.config,
      message: env.config ? '.reactpress/config.json 存在' : '缺少 .reactpress/config.json',
      fix: '运行 reactpress init',
    }) },
    { name: '环境变量', run: () => ({
      ok: env.env,
      message: env.env ? '.env 存在' : '缺少 .env',
      fix: '运行 reactpress init 或 reactpress config --apply',
    }) },
    { name: 'Docker', run: () => checkDocker() },
    { name: '端口', run: () => checkPorts(projectRoot) },
    { name: '数据库', run: () => checkDatabase(projectRoot) },
    { name: 'API 健康', run: () => checkApiHealth(projectRoot) },
  ];

  console.log('');
  console.log(chalk.bold.cyan('  ReactPress Doctor'));
  console.log(chalk.gray(`  项目: ${projectRoot}`));
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
    console.log(chalk.green('  全部检查通过，可以开始开发。'));
  } else {
    console.log(chalk.yellow(`  ${failed} 项需要处理。`));
  }
  console.log('');
  return failed === 0 ? 0 : 1;
}

module.exports = { runDoctor };
