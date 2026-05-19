const fs = require('fs');
const http = require('http');
const path = require('path');

function loadServerSiteUrl(projectRoot) {
  const envPath = path.join(projectRoot, '.env');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/^SERVER_SITE_URL=(.+)$/m);
    if (match) {
      return match[1].trim().replace(/^['"]|['"]$/g, '');
    }
  } catch {
    // ignore
  }
  return 'http://localhost:3002';
}

function loadClientSiteUrl(projectRoot) {
  const envPath = path.join(projectRoot, '.env');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/^CLIENT_SITE_URL=(.+)$/m);
    if (match) {
      return match[1].trim().replace(/^['"]|['"]$/g, '');
    }
  } catch {
    // ignore
  }
  return 'http://localhost:3001';
}

function getApiPrefix(projectRoot) {
  const envPath = path.join(projectRoot, '.env');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/^SERVER_API_PREFIX=(.+)$/m);
    if (match) {
      return match[1].trim().replace(/^['"]|['"]$/g, '');
    }
  } catch {
    // ignore
  }
  return '/api';
}

function getHealthUrl(projectRoot) {
  const base = loadServerSiteUrl(projectRoot).replace(/\/$/, '');
  const prefix = getApiPrefix(projectRoot).replace(/\/$/, '');
  return `${base}${prefix}/health`;
}

function probeHttp(url, timeoutMs = 3000) {
  return new Promise((resolve) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      resolve({ ok: false, statusCode: 0, data: null });
      return;
    }
    const port = parsed.port || (parsed.protocol === 'https:' ? 443 : 80);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port,
        path: parsed.pathname + (parsed.search || ''),
        method: 'GET',
        timeout: timeoutMs,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          const ok = res.statusCode === 200;
          let data = null;
          try {
            data = JSON.parse(body);
          } catch {
            // ignore
          }
          resolve({ ok, statusCode: res.statusCode, data });
        });
      }
    );
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, statusCode: 0, data: null });
    });
    req.on('error', () => resolve({ ok: false, statusCode: 0, data: null }));
    req.end();
  });
}

/**
 * Health probe: prefers `/api/health` JSON; falls back to API prefix (e.g. Swagger)
 * for older bundled servers that omit the health route.
 */
async function checkHealth(url, timeoutMs = 3000) {
  const primary = await probeHttp(url, timeoutMs);
  if (primary.ok) return primary;

  if (primary.statusCode === 404 || primary.statusCode === 0) {
    try {
      const parsed = new URL(url);
      const prefix = parsed.pathname.replace(/\/health\/?$/, '') || '/api';
      const candidates = [
        `${parsed.origin}${prefix}/`,
        `${parsed.origin}${prefix}`,
        parsed.origin,
      ];
      for (const fallback of candidates) {
        const alt = await probeHttp(fallback, timeoutMs);
        if (alt.statusCode === 200) {
          return {
            ok: true,
            statusCode: 200,
            data: { status: 'ok', database: 'unknown' },
          };
        }
      }
    } catch {
      // ignore
    }
  }

  return primary;
}

function isHttpResponding(url, timeoutMs = 2000) {
  return new Promise((resolve) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      resolve(false);
      return;
    }

    const port = parsed.port || (parsed.protocol === 'https:' ? 443 : 80);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port,
        path: parsed.pathname || '/',
        method: 'GET',
        timeout: timeoutMs,
      },
      (res) => resolve(res.statusCode > 0)
    );

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function waitForHttp(url, timeoutMs = 120_000, intervalMs = 500) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isHttpResponding(url)) {
      return true;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

module.exports = {
  loadServerSiteUrl,
  loadClientSiteUrl,
  getApiPrefix,
  getHealthUrl,
  checkHealth,
  isHttpResponding,
  waitForHttp,
};
