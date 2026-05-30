const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { runSync, runNodeScript, resolveCliScript } = require('./spawn');
const { getThemeBin, resolveProjectRoot } = require('./paths');
const { readActiveThemeManifest, resolveThemeDirectory } = require('./theme-runtime');
const { t } = require('./i18n');

function resolveProductionThemeEnv(projectRoot, themeDir) {
  const nginxEntry = (
    process.env.REACTPRESS_NGINX_ENTRY_URL ||
    process.env.NGINX_ENTRY_URL ||
    'http://localhost'
  ).replace(/\/$/, '');
  const visitorPort =
    process.env.CLIENT_PORT || process.env.PORT || process.env.REACTPRESS_VISITOR_INTERNAL_PORT || '13001';
  const apiPort =
    process.env.SERVER_PORT || process.env.REACTPRESS_API_INTERNAL_PORT || '13002';

  return {
    ...process.env,
    NODE_ENV: 'production',
    REACTPRESS_ORIGINAL_CWD: projectRoot,
    REACTPRESS_THEME_DIR: themeDir,
    PORT: String(visitorPort),
    CLIENT_PORT: String(visitorPort),
    NGINX_ENTRY_URL: nginxEntry,
    REACTPRESS_NGINX_ENTRY_URL: nginxEntry,
    REACTPRESS_API_URL: process.env.REACTPRESS_API_URL || `http://127.0.0.1:${apiPort}/api`,
    SERVER_API_URL: process.env.SERVER_API_URL || `http://127.0.0.1:${apiPort}/api`,
    NEXT_PUBLIC_REACTPRESS_API_URL:
      process.env.NEXT_PUBLIC_REACTPRESS_API_URL || `${nginxEntry}/api`,
    NEXT_PUBLIC_REACTPRESS_ADMIN_URL:
      process.env.NEXT_PUBLIC_REACTPRESS_ADMIN_URL || `${nginxEntry}/admin`,
  };
}

function resolveThemeClientBin(projectRoot, themeDir) {
  const themeBin = path.join(themeDir, 'bin', 'reactpress-client.js');
  if (fs.existsSync(themeBin)) return themeBin;
  const generic = resolveCliScript('bin/reactpress-theme-client.js');
  if (fs.existsSync(generic)) return generic;
  throw new Error(`Theme entry not found under ${themeDir}`);
}

const LAUNCH_FILE_REL_PATHS = [
  'server.js',
  path.join('scripts', 'ensure-typescript-for-next.js'),
];

function syncThemeLaunchFilesFromTemplate(projectRoot, themeId, themeDir) {
  const templateDir = path.join(resolveProjectRoot(projectRoot), 'themes', themeId);
  if (!templateDir || !fs.existsSync(templateDir)) return;
  if (path.resolve(templateDir) === path.resolve(themeDir)) return;

  for (const rel of LAUNCH_FILE_REL_PATHS) {
    const src = path.join(templateDir, rel);
    const dest = path.join(themeDir, rel);
    if (!fs.existsSync(src)) continue;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }

  const templatePkg = path.join(templateDir, 'package.json');
  const destPkg = path.join(themeDir, 'package.json');
  if (fs.existsSync(templatePkg) && fs.existsSync(destPkg)) {
    try {
      const srcScripts = JSON.parse(fs.readFileSync(templatePkg, 'utf8')).scripts || {};
      const destPkgJson = JSON.parse(fs.readFileSync(destPkg, 'utf8'));
      destPkgJson.scripts = { ...destPkgJson.scripts, start: srcScripts.start, dev: srcScripts.dev };
      fs.writeFileSync(destPkg, `${JSON.stringify(destPkgJson, null, 2)}\n`, 'utf8');
    } catch {
      // ignore corrupt package.json
    }
  }
}

function buildActiveTheme(projectRoot) {
  const { activeTheme } = readActiveThemeManifest(projectRoot);
  const themeDir = resolveThemeDirectory(projectRoot, activeTheme);
  if (!themeDir || !fs.existsSync(path.join(themeDir, 'package.json'))) {
    const err = new Error(`Active theme not found: ${activeTheme}`);
    err.code = 'REACTPRESS_THEME_NOT_FOUND';
    throw err;
  }

  syncThemeLaunchFilesFromTemplate(projectRoot, activeTheme, themeDir);

  console.log(`[reactpress] ${t('themeProd.building', { id: activeTheme })}`);
  runSync('pnpm', ['run', 'build'], {
    cwd: themeDir,
    env: {
      ...resolveProductionThemeEnv(projectRoot, themeDir),
      REACTPRESS_BUILD_ACTIVE: '1',
    },
  });
  return { activeTheme, themeDir };
}

/**
 * Rebuild active theme and restart PM2 visitor process (production deploy).
 */
async function restartProductionVisitorClient(projectRoot = resolveProjectRoot()) {
  const { activeTheme, themeDir } = buildActiveTheme(projectRoot);
  const bin = resolveThemeClientBin(projectRoot, themeDir);
  const env = resolveProductionThemeEnv(projectRoot, themeDir);

  spawnSync('pm2', ['delete', 'reactpress-client'], { stdio: 'ignore' });
  spawnSync('pm2', ['delete', '@fecommunity/reactpress-template-twentytwentyfive'], {
    stdio: 'ignore',
  });
  spawnSync('pm2', ['delete', '@fecommunity/reactpress-template-hello-world'], {
    stdio: 'ignore',
  });

  console.log(`[reactpress] ${t('themeProd.restarting', { id: activeTheme })}`);
  await runNodeScript(bin, ['--pm2'], { cwd: projectRoot, env });
  console.log(`[reactpress] ${t('themeProd.restarted', { id: activeTheme })}`);
}

module.exports = {
  buildActiveTheme,
  restartProductionVisitorClient,
  resolveProductionThemeEnv,
};
