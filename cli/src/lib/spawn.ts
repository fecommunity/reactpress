// @ts-nocheck
const { spawn, spawnSync } = require('child_process');
const path = require('path');
const chalk = require('chalk');
const { ensureOriginalCwd } = require('./root');
const { getCliPackageRoot } = require('./paths');
const { t, resolveLocale } = require('./i18n');

function runSync(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || ensureOriginalCwd(),
    stdio: options.stdio ?? 'inherit',
    env: {
      ...process.env,
      REACTPRESS_LANG: process.env.REACTPRESS_LANG || resolveLocale(),
      REACTPRESS_ORIGINAL_CWD:
        options.cwd || process.env.REACTPRESS_ORIGINAL_CWD || process.cwd(),
      ...options.env,
    },
    shell: options.shell ?? false,
  });
  if (result.status !== 0) {
    const err = new Error(
      t('spawn.commandFailed', { command, code: result.status ?? 1 })
    );
    err.exitCode = result.status ?? 1;
    throw err;
  }
  return result;
}

function runNodeScript(scriptPath, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      stdio: 'inherit',
      cwd: options.cwd || ensureOriginalCwd(),
      env: {
        ...process.env,
        REACTPRESS_LANG: process.env.REACTPRESS_LANG || resolveLocale(),
        REACTPRESS_ORIGINAL_CWD:
          options.cwd || process.env.REACTPRESS_ORIGINAL_CWD || process.cwd(),
        ...options.env,
      },
    });

    child.on('error', (error) => {
      console.error(chalk.red('[ReactPress]'), error.message || error);
      reject(error);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(Object.assign(new Error(t('spawn.exitCode', { code })), { exitCode: code }));
        return;
      }
      resolve(code);
    });
  });
}

function spawnDetached(scriptPath, args = [], options = {}) {
  const child = spawn(process.execPath, [scriptPath, ...args], {
    stdio: options.stdio ?? 'ignore',
    detached: true,
    cwd: options.cwd,
    env: {
      ...process.env,
      REACTPRESS_LANG: process.env.REACTPRESS_LANG || resolveLocale(),
      REACTPRESS_ORIGINAL_CWD:
        options.cwd || process.env.REACTPRESS_ORIGINAL_CWD || process.cwd(),
      ...options.env,
    },
  });
  child.unref();
  return child;
}

async function runReactpressCli(args, options = {}) {
  const { initProject } = require('../core/services/init');
  const directory = args[1] ?? options.cwd ?? ensureOriginalCwd();
  const force = args.includes('--force');
  const local = args.includes('--local');
  const result = await initProject({
    directory: path.resolve(String(directory)),
    force,
    local,
  });
  console.log(`[reactpress] ${result.message}`);
  if (!result.ok) {
    const err = new Error(result.message);
    (err as NodeJS.ErrnoException & { exitCode?: number }).exitCode = 1;
    throw err;
  }
}

function resolveCliScript(relativePath) {
  return path.join(__dirname, '..', relativePath);
}

module.exports = {
  runSync,
  runNodeScript,
  spawnDetached,
  runReactpressCli,
  resolveCliScript,
};
