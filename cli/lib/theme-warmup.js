const fs = require('fs');
const path = require('path');
const http = require('http');
const { readActiveThemeManifest, resolveThemeDirectory } = require('./theme-runtime');
const { loadClientSiteUrl } = require('./http');

/** Placeholder for dynamic segments — only triggers page bundle compilation in dev. */
const WARMUP_PARAM = '__reactpress_dev_warmup__';

function pageFileToRoute(pageFile) {
  let route = String(pageFile)
    .replace(/^pages\//, '')
    .replace(/\.(tsx|ts|jsx|js)$/, '');
  if (route === 'index') return '/';
  route = route.replace(/\/index$/, '');
  route = route.replace(/\[([^\]]+)\]/g, WARMUP_PARAM);
  return `/${route}`;
}

function collectWarmupRoutes(themeDir) {
  const themeJsonPath = path.join(themeDir, 'theme.json');
  const routes = new Set(['/']);

  if (fs.existsSync(themeJsonPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(themeJsonPath, 'utf8'));
      const templates = manifest?.reactpress?.templates;
      if (templates && typeof templates === 'object') {
        for (const file of Object.values(templates)) {
          if (typeof file === 'string') routes.add(pageFileToRoute(file));
        }
      }
    } catch {
      // fall through to pages scan
    }
  }

  const pagesDir = path.join(themeDir, 'pages');
  if (fs.existsSync(pagesDir)) {
    walkPages(pagesDir, pagesDir).forEach((file) => routes.add(pageFileToRoute(path.relative(themeDir, file))));
  }

  routes.add('/404');
  return [...routes];
}

function walkPages(pagesDir, currentDir, files = []) {
  for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('_') || entry.name === 'api') continue;
      walkPages(pagesDir, fullPath, files);
      continue;
    }
    if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      if (entry.name.startsWith('_')) continue;
      files.push(fullPath);
    }
  }
  return files;
}

function fetchRoute(baseUrl, routePath) {
  return new Promise((resolve) => {
    const normalizedBase = baseUrl.replace(/\/$/, '');
    const url = `${normalizedBase}${routePath.startsWith('/') ? routePath : `/${routePath}`}`;
    const req = http.get(url, { timeout: 120_000 }, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * SSR-hit theme routes on the internal dev port so Next.js compiles page chunks
 * before the browser performs client-side navigation (avoids webpack module mismatch).
 */
async function warmupThemeDevRoutes(projectRoot) {
  const { activeTheme } = readActiveThemeManifest(projectRoot);
  const themeDir = resolveThemeDirectory(projectRoot, activeTheme);
  if (!themeDir) return { ok: false, routes: [] };

  const baseUrl = loadClientSiteUrl(projectRoot);
  const routes = collectWarmupRoutes(themeDir);
  for (const route of routes) {
    await fetchRoute(baseUrl, route);
  }
  return { ok: true, routes, themeId: activeTheme };
}

module.exports = {
  WARMUP_PARAM,
  pageFileToRoute,
  collectWarmupRoutes,
  warmupThemeDevRoutes,
};
