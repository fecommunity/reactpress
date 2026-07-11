// @ts-nocheck
/** Stable :3003 front door — forwards to warm theme backends on :3004+. */
const http = require('http');
const { getPreviewProxyPort } = require('./theme-paths');

const PREVIEW_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

let proxyTargetPort = null;
/** @type {import('http').Server | null} */
let proxyServer = null;
let listenPort = null;

function setPreviewProxyTarget(backendPort) {
  proxyTargetPort = backendPort;
}

function getPreviewProxyTarget() {
  return proxyTargetPort;
}

function proxyRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, PREVIEW_CORS_HEADERS);
    res.end();
    return;
  }

  if (!proxyTargetPort) {
    res.writeHead(503, {
      ...PREVIEW_CORS_HEADERS,
      'Content-Type': 'text/plain; charset=utf-8',
    });
    res.end('Theme preview starting…');
    return;
  }

  const headers = {
    ...req.headers,
    host: `127.0.0.1:${proxyTargetPort}`,
  };
  delete headers.origin;
  delete headers.referer;

  const proxyReq = http.request(
    {
      hostname: '127.0.0.1',
      port: proxyTargetPort,
      path: req.url,
      method: req.method,
      headers,
    },
    (proxyRes) => {
      const outHeaders = { ...proxyRes.headers, ...PREVIEW_CORS_HEADERS };
      res.writeHead(proxyRes.statusCode || 502, outHeaders);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(502, {
        ...PREVIEW_CORS_HEADERS,
        'Content-Type': 'text/plain; charset=utf-8',
      });
      res.end('Preview backend unavailable');
    }
  });

  if (req.method === 'GET' || req.method === 'HEAD') {
    proxyReq.end();
  } else {
    req.pipe(proxyReq);
  }
}

function ensurePreviewProxyRunning(port) {
  const proxyPort = port ?? getPreviewProxyPort();
  if (proxyServer && listenPort === proxyPort) {
    return Promise.resolve(proxyServer);
  }

  return stopPreviewProxy().then(
    () =>
      new Promise((resolve, reject) => {
        const server = http.createServer(proxyRequest);
        server.on('error', reject);
        server.listen(proxyPort, '127.0.0.1', () => {
          proxyServer = server;
          listenPort = proxyPort;
          resolve(server);
        });
      }),
  );
}

function stopPreviewProxy() {
  proxyTargetPort = null;
  if (!proxyServer) return Promise.resolve();

  const server = proxyServer;
  proxyServer = null;
  listenPort = null;
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}

module.exports = {
  setPreviewProxyTarget,
  getPreviewProxyTarget,
  ensurePreviewProxyRunning,
  stopPreviewProxy,
};
