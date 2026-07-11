// @ts-nocheck
const chalk = require('chalk');
const { installThemeFromNpm } = require('./theme-install');
const { readThemeLock } = require('./theme-lock');
const { readThemeCatalog, resolveCatalogInstallSpec } = require('./theme-catalog');
const { listAvailableThemeIds } = require('./theme-runtime');
const { t } = require('./i18n');

async function runThemeAdd(projectRoot, spec, options = {}) {
  const trimmed = String(spec || '').trim();
  if (!trimmed) {
    throw new Error(t('themeInstall.specRequired'));
  }

  const resolvedSpec = resolveCatalogInstallSpec(projectRoot, trimmed) || trimmed;
  console.log(chalk.cyan('[reactpress]'), t('themeInstall.installing', { spec: resolvedSpec }));
  const result = await installThemeFromNpm(projectRoot, resolvedSpec, {
    skipDependencies: options.skipDependencies === true,
  });

  console.log(
    chalk.green('[reactpress]'),
    t('themeInstall.success', {
      id: result.themeId,
      name: result.name,
      dir: result.themeDirRel,
    }),
  );
  console.log(chalk.gray(t('themeInstall.nextActivate', { id: result.themeId })));
  return result;
}

function runThemeList(projectRoot) {
  const ids = listAvailableThemeIds(projectRoot);
  const lock = readThemeLock(projectRoot);
  if (!ids.length) {
    console.log(t('themeInstall.listEmpty'));
    return;
  }
  console.log(t('themeInstall.listHeading'));
  for (const id of ids.sort()) {
    const npm = lock.themes[id];
    if (npm?.source === 'npm') {
      console.log(`  - ${id} (${npm.spec})`);
    } else {
      console.log(`  - ${id}`);
    }
  }
}

module.exports = {
  runThemeAdd,
  runThemeList,
};
