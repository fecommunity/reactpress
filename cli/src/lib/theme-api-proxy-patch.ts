// @ts-nocheck
const fs = require('fs');
const path = require('path');

const PATCH_MARKER = '.reactpress-api-proxy-patched';

const ROUTE_REL = path.join('app', 'api', '[[...path]]', 'route.ts');

/** Buggy pattern: body read before mock/proxy branch (breaks upstream proxy). */
const BUGGY_BLOCK = `  const keyword = new URL(request.url).searchParams.get('keyword')?.trim() ?? ''
  const body = await readJsonBody(request)

  let response: Response
  if (isMockApiEnabled()) {
    const mockResponse = matchMockRoute(request.method, path, { keyword, body })`;

const FIXED_BLOCK = `  const keyword = new URL(request.url).searchParams.get('keyword')?.trim() ?? ''

  let response: Response
  if (isMockApiEnabled()) {
    const body = await readJsonBody(request)
    const mockResponse = matchMockRoute(request.method, path, { keyword, body })`;

function resolveApiRoutePath(themeDir) {
  if (!themeDir) return null;
  const routePath = path.join(themeDir, ROUTE_REL);
  return fs.existsSync(routePath) ? routePath : null;
}

/**
 * App Router themes proxy /api via app/api/[[...path]]/route.ts.
 * Older theme-starter builds read the request body before the mock branch,
 * which leaves nothing for proxyToUpstreamApi() in production.
 */
function patchThemeApiProxyRoute(themeDir) {
  const routePath = resolveApiRoutePath(themeDir);
  if (!routePath) return false;

  const markerPath = path.join(themeDir, PATCH_MARKER);
  let src = fs.readFileSync(routePath, 'utf8');

  if (src.includes(FIXED_BLOCK)) {
    if (!fs.existsSync(markerPath)) {
      fs.writeFileSync(markerPath, `${new Date().toISOString()}\n`, 'utf8');
    }
    return false;
  }

  if (!src.includes(BUGGY_BLOCK)) {
    return false;
  }

  src = src.replace(BUGGY_BLOCK, FIXED_BLOCK);
  fs.writeFileSync(routePath, src, 'utf8');
  fs.writeFileSync(markerPath, `${new Date().toISOString()}\n`, 'utf8');
  return true;
}

module.exports = {
  PATCH_MARKER,
  ROUTE_REL,
  patchThemeApiProxyRoute,
  resolveApiRoutePath,
};
