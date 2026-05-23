const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const {
  loadServerSiteUrl,
  loadClientSiteUrl,
  getHealthUrl,
  checkHealth,
  isHttpResponding,
} = require('./http');
const { isUsingMonorepoServer } = require('./paths');
const { readPid, isProcessRunning } = require('./process');
const { isDockerRunning } = require('./docker');
const { ensureOriginalCwd } = require('./root');
const { t } = require('./i18n');

function envFileStatus(projectRoot) {
  const envPath = path.join(projectRoot, '.env');
  const configPath = path.join(projectRoot, '.reactpress', 'config.json');
  return {
    env: fs.existsSync(envPath),
    config: fs.existsSync(configPath),
    envPath,
    configPath,
  };
}

async function printUnifiedStatus(projectRoot = ensureOriginalCwd()) {
  const env = envFileStatus(projectRoot);
  const apiUrl = loadServerSiteUrl(projectRoot);
  const clientUrl = loadClientSiteUrl(projectRoot);
  const pid = readPid(projectRoot);
  const healthUrl = getHealthUrl(projectRoot);
  const [apiHttp, clientHttp, health] = await Promise.all([
    isHttpResponding(apiUrl),
    isHttpResponding(clientUrl),
    checkHealth(healthUrl),
  ]);

  const apiSource = isUsingMonorepoServer()
    ? t('status.apiSource.monorepo')
    : t('status.apiSource.bundle');

  console.log('');
  console.log(chalk.bold.cyan(t('status.title')));
  console.log(chalk.gray('  ─────────────────────────────────────'));
  console.log(t('status.dir', { path: projectRoot }));
  console.log(t('status.apiSource', { source: apiSource }));
  console.log(
    `  ${chalk.bold('Config')}    ${
      env.config
        ? chalk.green(t('status.configOk'))
        : chalk.yellow(t('status.configBad'))
    }`,
  );
  console.log(
    `  ${chalk.bold('.env')}        ${
      env.env ? chalk.green(t('status.envOk')) : chalk.yellow(t('status.envBad'))
    }`,
  );
  console.log(chalk.gray('  ─────────────────────────────────────'));
  console.log(chalk.bold('  API'));
  console.log(`    URL       ${apiUrl}`);
  console.log(
    `    HTTP      ${
      apiHttp ? chalk.green(t('status.apiOnline')) : chalk.red(t('status.apiOffline'))
    }`,
  );
  console.log(
    `    Health    ${
      health.ok
        ? chalk.green(`${healthUrl} ✓`)
        : chalk.gray(t('status.apiUnreachable', { url: healthUrl }))
    }`,
  );
  if (health.ok && health.data?.data) {
    const db = health.data.data.database;
    console.log(
      `    Database  ${
        db === 'up'
          ? chalk.green(t('status.dbUp'))
          : chalk.red(db === 'down' ? t('status.dbDown') : '—')
      }`,
    );
  }
  console.log(
    `    PID       ${pid ?? '—'} ${
      pid && isProcessRunning(pid) ? chalk.green(t('status.pidRunning')) : ''
    }`,
  );
  console.log(chalk.bold(t('status.frontend')));
  console.log(`    URL       ${clientUrl}`);
  console.log(
    `    HTTP      ${
      clientHttp ? chalk.green(t('status.apiOnline')) : chalk.gray(t('status.apiOffline'))
    }`,
  );
  console.log(chalk.gray('  ─────────────────────────────────────'));
  console.log(chalk.bold(t('status.docker')));
  console.log(
    `    Engine    ${
      isDockerRunning() ? chalk.green(t('status.dockerUp')) : chalk.red(t('status.dockerDown'))
    }`,
  );
  console.log('');
}

module.exports = { printUnifiedStatus, envFileStatus };
