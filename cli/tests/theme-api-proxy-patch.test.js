const fs = require('fs');
const os = require('os');
const path = require('path');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  PATCH_MARKER,
  patchThemeApiProxyRoute,
  resolveApiRoutePath,
} = require('../out/lib/theme-api-proxy-patch');

const STARTER_ROUTE = path.join(
  __dirname,
  '../../.reactpress/runtime/reactpress-theme-starter/app/api/[[...path]]/route.ts',
);

describe('lib/theme-api-proxy-patch', () => {
  it('resolveApiRoutePath finds App Router catch-all route', () => {
    const themeDir = path.dirname(path.dirname(path.dirname(path.dirname(STARTER_ROUTE))));
    assert.ok(resolveApiRoutePath(themeDir));
  });

  it('patchThemeApiProxyRoute fixes body read before proxy branch', () => {
    const themeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reactpress-api-proxy-'));
    const routeDir = path.join(themeDir, 'app', 'api', '[[...path]]');
    fs.mkdirSync(routeDir, { recursive: true });

    const buggy = `async function handleRequest(request: Request) {
  const keyword = new URL(request.url).searchParams.get('keyword')?.trim() ?? ''
  const body = await readJsonBody(request)

  let response: Response
  if (isMockApiEnabled()) {
    const mockResponse = matchMockRoute(request.method, path, { keyword, body })
    response = mockResponse ?? Response.json({ success: true, data: null })
  } else {
    response = await proxyToUpstreamApi(request, path)
  }
}
`;

    fs.writeFileSync(path.join(routeDir, 'route.ts'), buggy, 'utf8');

    assert.equal(patchThemeApiProxyRoute(themeDir), true);
    const patched = fs.readFileSync(path.join(routeDir, 'route.ts'), 'utf8');
    assert.match(patched, /if \(isMockApiEnabled\(\)\) \{\n    const body = await readJsonBody\(request\)/);
    assert.ok(!patched.includes('const body = await readJsonBody(request)\n\n  let response'));
    assert.ok(fs.existsSync(path.join(themeDir, PATCH_MARKER)));
    assert.equal(patchThemeApiProxyRoute(themeDir), false);
  });

  it('leaves already-fixed route.ts unchanged', () => {
    if (!fs.existsSync(STARTER_ROUTE)) return;
    const themeDir = path.dirname(path.dirname(path.dirname(path.dirname(STARTER_ROUTE))));
    assert.equal(patchThemeApiProxyRoute(themeDir), false);
  });
});
