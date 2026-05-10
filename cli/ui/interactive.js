const inquirer = require('inquirer');
const open = require('open');
const { printBanner } = require('./banner');
const { brand, label } = require('./theme');
const { ensureOriginalCwd } = require('../lib/root');
const { ensureProjectEnvironment } = require('../lib/bootstrap');
const { runDev } = require('../lib/dev');
const { runApiDev } = require('../lib/api-dev');
const { runLifecycleCommand } = require('../lib/lifecycle');
const { runDockerCommand } = require('../lib/docker');
const { printUnifiedStatus } = require('../lib/status');
const { runDoctor } = require('../lib/doctor');
const { runBuild } = require('../lib/build');
const { runNodeScript } = require('../lib/spawn');
const { getClientBin } = require('../lib/paths');
const { loadClientSiteUrl } = require('../lib/http');

const MENU_ACTIONS = [
  { name: '零配置开发 (env + DB + API + 前端)', value: 'dev' },
  { name: '初始化项目 (.reactpress + .env + 数据库)', value: 'init' },
  { name: '查看项目状态', value: 'status' },
  { name: '环境诊断 (doctor)', value: 'doctor' },
  new inquirer.Separator(),
  { name: '仅启动 API (开发 watch)', value: 'dev:api' },
  { name: '仅启动前端', value: 'dev:client' },
  { name: '启动 API (后台生产)', value: 'server:start' },
  { name: '停止 API', value: 'server:stop' },
  { name: '重启 API', value: 'server:restart' },
  new inquirer.Separator(),
  { name: '构建 (toolkit → server → client)', value: 'build' },
  { name: 'Docker 开发环境 (DB + nginx + 全栈)', value: 'docker:start' },
  { name: 'Docker 仅启动数据库', value: 'docker:up' },
  { name: '停止 Docker 服务', value: 'docker:stop' },
  new inquirer.Separator(),
  { name: '在浏览器打开管理后台', value: 'open:admin' },
  { name: '发布 npm 包 (交互式)', value: 'publish' },
  { name: '退出', value: 'exit' },
];

async function runMenuAction(action, projectRoot) {
  switch (action) {
    case 'dev':
      console.log(label('启动全栈开发…'));
      await runDev(projectRoot);
      return false;
    case 'init': {
      console.log(label('初始化项目…'));
      const result = await ensureProjectEnvironment(projectRoot);
      console.log(brand.success(result.message || '完成'));
      return true;
    }
    case 'status':
      await printUnifiedStatus(projectRoot);
      return true;
    case 'doctor': {
      const code = await runDoctor(projectRoot);
      if (code !== 0) process.exit(code);
      return true;
    }
    case 'dev:api':
      await runApiDev(projectRoot);
      return false;
    case 'dev:client':
      await runNodeScript(getClientBin(), [], { cwd: projectRoot });
      return false;
    case 'server:start': {
      const code = await runLifecycleCommand('start', projectRoot);
      if (code !== 0) process.exit(code);
      return true;
    }
    case 'server:stop':
      await runLifecycleCommand('stop', projectRoot);
      return true;
    case 'server:restart': {
      const code = await runLifecycleCommand('restart', projectRoot);
      if (code !== 0) process.exit(code);
      return true;
    }
    case 'build':
      await runBuild('all', projectRoot);
      return true;
    case 'docker:start':
      await runDockerCommand('start', projectRoot);
      return false;
    case 'docker:up':
      await runDockerCommand('up', projectRoot);
      return true;
    case 'docker:stop':
      await runDockerCommand('down', projectRoot);
      return true;
    case 'open:admin': {
      const url = loadClientSiteUrl(projectRoot);
      console.log(label(`打开 ${url}`));
      await open(url);
      return true;
    }
    case 'publish': {
      const prev = process.argv.slice();
      process.argv = [process.argv[0], process.argv[1], '--publish'];
      await require('../lib/publish').main();
      process.argv = prev;
      return true;
    }
    case 'exit':
      console.log(brand.muted('  再见。'));
      return false;
    default:
      return true;
  }
}

async function runInteractiveLoop() {
  const projectRoot = ensureOriginalCwd();
  printBanner();

  let loop = true;
  while (loop) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择操作',
        pageSize: 14,
        choices: MENU_ACTIONS,
      },
    ]);

    if (action === 'exit') {
      console.log(brand.muted('  再见。'));
      break;
    }

    try {
      const stay = await runMenuAction(action, projectRoot);
      if (!stay) {
        break;
      }

      if (action !== 'status') {
        const { again } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'again',
            message: '返回主菜单？',
            default: true,
          },
        ]);
        loop = again;
      }
    } catch (err) {
      console.error(brand.error(`  ${err.message || err}`));
      const { retry } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'retry',
          message: '返回主菜单重试？',
          default: true,
        },
      ]);
      loop = retry;
    }
  }
}

module.exports = { runInteractiveLoop, runMenuAction };
