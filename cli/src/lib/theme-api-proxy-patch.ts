// @ts-nocheck
const fs = require('fs');
const path = require('path');

const PATCH_MARKER = '.reactpress-api-proxy-patched';
const ENCODING_PATCH_MARKER = 'reactpress-api-proxy-encoding';

const ROUTE_REL = path.join('app', 'api', '[[...path]]', 'route.ts');
const PROXY_REL = path.join('lib', 'mock-api', 'proxy.ts');

/** Buggy pattern: body read before mock/proxy branch (breaks upstream proxy). */
const BUGGY_ROUTE_BLOCK = `  const keyword = new URL(request.url).searchParams.get('keyword')?.trim() ?? ''
  const body = await readJsonBody(request)

  let response: Response
  if (isMockApiEnabled()) {
    const mockResponse = matchMockRoute(request.method, path, { keyword, body })`;

const FIXED_ROUTE_BLOCK = `  const keyword = new URL(request.url).searchParams.get('keyword')?.trim() ?? ''

  let response: Response
  if (isMockApiEnabled()) {
    const body = await readJsonBody(request)
    const mockResponse = matchMockRoute(request.method, path, { keyword, body })`;

const BUGGY_PROXY_BLOCK = `  return new Response(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  })`;

const FIXED_PROXY_BLOCK = `  const responseHeaders = new Headers(upstream.headers)
  // ${ENCODING_PATCH_MARKER}: Node fetch decompresses bodies; strip stale encoding headers.
  responseHeaders.delete('content-encoding')
  responseHeaders.delete('content-length')
  responseHeaders.delete('transfer-encoding')

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  })`;

function resolveApiRoutePath(themeDir) {
  if (!themeDir) return null;
  const routePath = path.join(themeDir, ROUTE_REL);
  return fs.existsSync(routePath) ? routePath : null;
}

function resolveApiProxyPath(themeDir) {
  if (!themeDir) return null;
  const proxyPath = path.join(themeDir, PROXY_REL);
  return fs.existsSync(proxyPath) ? proxyPath : null;
}

function touchPatchMarker(themeDir) {
  fs.writeFileSync(path.join(themeDir, PATCH_MARKER), `${new Date().toISOString()}\n`, 'utf8');
}

function patchThemeApiRouteBodyRead(themeDir) {
  const routePath = resolveApiRoutePath(themeDir);
  if (!routePath) return false;

  let src = fs.readFileSync(routePath, 'utf8');
  if (src.includes(FIXED_ROUTE_BLOCK) || !src.includes(BUGGY_ROUTE_BLOCK)) {
    return false;
  }

  src = src.replace(BUGGY_ROUTE_BLOCK, FIXED_ROUTE_BLOCK);
  fs.writeFileSync(routePath, src, 'utf8');
  return true;
}

/**
 * Node fetch() auto-decompresses upstream bodies but leaves Content-Encoding on the Response.
 * Browsers then fail with ERR_CONTENT_DECODING_FAILED (HTTP 200).
 */
function patchThemeApiProxyEncodingHeaders(themeDir) {
  const proxyPath = resolveApiProxyPath(themeDir);
  if (!proxyPath) return false;

  let src = fs.readFileSync(proxyPath, 'utf8');
  if (src.includes(ENCODING_PATCH_MARKER) || !src.includes(BUGGY_PROXY_BLOCK)) {
    return false;
  }

  src = src.replace(BUGGY_PROXY_BLOCK, FIXED_PROXY_BLOCK);
  fs.writeFileSync(proxyPath, src, 'utf8');
  return true;
}

/**
 * App Router themes proxy /api via app/api/[[...path]]/route.ts.
 * Patches known theme-starter issues before production build.
 */
function patchThemeApiProxyRoute(themeDir) {
  const routePatched = patchThemeApiRouteBodyRead(themeDir);
  const proxyPatched = patchThemeApiProxyEncodingHeaders(themeDir);
  if (routePatched || proxyPatched) {
    touchPatchMarker(themeDir);
  }
  return routePatched || proxyPatched;
}

module.exports = {
  PATCH_MARKER,
  ENCODING_PATCH_MARKER,
  ROUTE_REL,
  PROXY_REL,
  patchThemeApiProxyRoute,
  patchThemeApiRouteBodyRead,
  patchThemeApiProxyEncodingHeaders,
  resolveApiRoutePath,
  resolveApiProxyPath,
};
