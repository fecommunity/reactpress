#!/usr/bin/env node
/**
 * API 冒烟：要求 API 已启动且 .env 已配置
 * 用法: node scripts/smoke-api-health.mjs
 */
import http from 'http';

const base = (process.env.SERVER_SITE_URL || 'http://127.0.0.1:3002').replace(/\/$/, '');
const prefix = (process.env.SERVER_API_PREFIX || '/api').replace(/\/$/, '');
const url = `${base}${prefix}/health`;

let body;
try {
  body = await new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('timeout'));
    });
  });
} catch (err) {
  console.error(`[smoke] request failed for ${url}: ${err.message}`);
  process.exit(1);
}

if (body.statusCode !== 200) {
  console.error(`[smoke] HTTP ${body.statusCode} from ${url}`);
  process.exit(1);
}

let json;
try {
  json = JSON.parse(body.data);
} catch {
  console.error('[smoke] invalid JSON');
  process.exit(1);
}

const health = json.data || json;
if (health.status !== 'ok' && health.status !== 'degraded') {
  console.error('[smoke] unexpected health payload', json);
  process.exit(1);
}

console.log(`[smoke] OK ${url} → status=${health.status} database=${health.database}`);
process.exit(0);
