// @ts-nocheck
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

/** Dynamic SSR routes need real API data — warmup only compiles static visitor pages. */
function isWarmupSafeRoute(route) {
  if (!route || typeof route !== 'string') return false;
  if (route.includes(WARMUP_PARAM)) return false;
  if (route.startsWith('/admin')) return false;
  return true;
}

function collectWarmupRoutes(themeDir) {
  const themeJsonPath = path.join(themeDir, 'theme.json');
  const routes = new Set(['/']);
  let fromThemeJson = false;

  if (fs.existsSync(path.join(themeDir, 'app'))) {
    routes.add('/');
  }

  if (fs.existsSync(themeJsonPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(themeJsonPath, 'utf8'));
      const templates = manifest?.reactpress?.templates;
      if (templates && typeof templates === 'object') {
        fromThemeJson = true;
        for (const file of Object.values(templates)) {
          if (typeof file !== 'string') continue;
          const route = pageFileToRoute(file);
          if (isWarmupSafeRoute(route)) routes.add(route);
        }
      }
    } catch {
      // fall through to pages scan
    }
  }

  if (!fromThemeJson) {
    const pagesDir = path.join(themeDir, 'pages');
    if (fs.existsSync(pagesDir)) {
      walkPages(pagesDir, pagesDir).forEach((file) => {
        const rel = path.relative(themeDir, file);
        if (rel.startsWith(`pages${path.sep}admin${path.sep}`) || rel.includes(`${path.sep}admin${path.sep}`)) {
          return;
        }
        const route = pageFileToRoute(rel);
        if (isWarmupSafeRoute(route)) routes.add(route);
      });
    }
  }

  routes.add('/404');
  return [...routes].filter(isWarmupSafeRoute);
}

function walkPages(pagesDir, currentDir, files = []) {
  for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('_') || entry.name === 'api' || entry.name === 'admin') continue;
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

async function mapWithConcurrency(items, concurrency, fn) {
  if (!items.length) return [];
  const limit = Math.max(1, Math.min(concurrency, items.length));
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index;
      index += 1;
      results[i] = await fn(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: limit }, () => worker()));
  return results;
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
  const concurrency = Math.max(
    1,
    parseInt(process.env.REACTPRESS_THEME_WARMUP_CONCURRENCY || '6', 10) || 6,
  );
  await mapWithConcurrency(routes, concurrency, (route) => fetchRoute(baseUrl, route));
  return { ok: true, routes, themeId: activeTheme };
}

function shouldBlockOnThemeWarmup() {
  return process.env.REACTPRESS_THEME_WARMUP === '1';
}

/** Fire-and-forget SSR compile — off by default (saves ~10–20s Next compile after banner). */
function warmupThemeDevRoutesInBackground(projectRoot) {
  if (process.env.REACTPRESS_SKIP_THEME_WARMUP !== '0') return;
  if (process.env.REACTPRESS_THEME_WARMUP !== '1') return;
  warmupThemeDevRoutes(projectRoot).catch(() => {
    // non-fatal — first browser navigation will compile anyway
  });
}

/** SSR-hit homepage so first visitor load after theme switch is fast. */
async function warmupThemeHomepage(projectRoot, baseUrl) {
  const url = (baseUrl || loadClientSiteUrl(projectRoot)).replace(/\/$/, '');
  await fetchRoute(url, '/');
  return { ok: true };
}

module.exports = {
  WARMUP_PARAM,
  pageFileToRoute,
  isWarmupSafeRoute,
  collectWarmupRoutes,
  mapWithConcurrency,
  shouldBlockOnThemeWarmup,
  warmupThemeDevRoutes,
  warmupThemeDevRoutesInBackground,
  warmupThemeHomepage,
};
