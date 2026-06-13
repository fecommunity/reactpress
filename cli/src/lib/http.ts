// @ts-nocheck
const fs = require('fs');
const http = require('http');
const path = require('path');
const { DEV_PORTS } = require('./ports');
const {
  normalizeHealthPayload,
  isHealthPayloadReady,
  isHealthHttpReady,
} = require('./health-parse');

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

function loadWebAdminUrl(projectRoot) {
  const envPath = path.join(projectRoot, '.env');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const urlMatch = content.match(/^WEB_ADMIN_URL=(.+)$/m);
    if (urlMatch) {
      return urlMatch[1].trim().replace(/^['"]|['"]$/g, '');
    }
    const portMatch = content.match(/^WEB_ADMIN_PORT=(.+)$/m);
    if (portMatch) {
      const port = parseInt(portMatch[1].trim(), 10);
      if (Number.isInteger(port) && port > 0) {
        return `http://localhost:${port}`;
      }
    }
  } catch {
    // ignore
  }
  return `http://localhost:${DEV_PORTS.ADMIN_WEB}`;
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

/** Use IPv4 loopback for probes — `localhost` often resolves to `::1` while Nest binds IPv4. */
function parseProbeTarget(urlString) {
  const parsed = new URL(urlString);
  const host = parsed.hostname;
  if (host === 'localhost' || host === '::1' || host === '[::1]') {
    parsed.hostname = '127.0.0.1';
  }
  return parsed;
}

function normalizeProbeUrl(urlString) {
  return parseProbeTarget(urlString).toString();
}

function probeHttp(url, timeoutMs = 3000) {
  return new Promise((resolve) => {
    let parsed;
    try {
      parsed = parseProbeTarget(url);
    } catch {
      resolve({ ok: false, statusCode: 0, data: null });
      return;
    }
    const port = parsed.port || (parsed.protocol === 'https:' ? 443 : 80);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port,
        family: 4,
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
  const primary = await probeHttp(normalizeProbeUrl(url), timeoutMs);
  const payload = normalizeHealthPayload(primary.data);
  if (isHealthHttpReady(primary.statusCode, primary.data)) {
    return { ok: true, statusCode: primary.statusCode, data: payload };
  }
  if (primary.ok) {
    return { ok: false, statusCode: primary.statusCode, data: payload ?? primary.data };
  }

  if (primary.statusCode === 404 || primary.statusCode === 0) {
    try {
      const parsed = parseProbeTarget(url);
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
            ok: false,
            statusCode: 200,
            data: { status: 'degraded', database: 'unknown' },
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
      parsed = parseProbeTarget(url);
    } catch {
      resolve(false);
      return;
    }

    const port = parsed.port || (parsed.protocol === 'https:' ? 443 : 80);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port,
        family: 4,
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

/** Poll until HTTP 200 — used for theme dev homepage compile readiness. */
async function waitForHttpOk(url, timeoutMs = 120_000, intervalMs = 500) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const result = await probeHttp(normalizeProbeUrl(url), Math.min(intervalMs + 500, 3000));
    if (result.ok) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

module.exports = {
  isHealthPayloadReady,
  loadServerSiteUrl,
  loadWebAdminUrl,
  loadClientSiteUrl,
  getApiPrefix,
  getHealthUrl,
  normalizeProbeUrl,
  checkHealth,
  isHttpResponding,
  waitForHttp,
  waitForHttpOk,
  probeHttp,
  normalizeProbeUrl,
};
