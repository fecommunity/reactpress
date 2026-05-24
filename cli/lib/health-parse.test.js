const assert = require('assert');
const {
  normalizeHealthPayload,
  isHealthPayloadReady,
  isHealthHttpReady,
} = require('./health-parse');

assert.strictEqual(
  isHealthHttpReady(200, {
    statusCode: 200,
    success: true,
    data: { status: 'ok', database: 'up', version: '3.0.0' },
  }),
  true,
);

assert.strictEqual(
  isHealthHttpReady(200, { status: 'ok', database: 'up' }),
  true,
);

assert.strictEqual(
  isHealthHttpReady(200, {
    statusCode: 200,
    success: true,
    data: { status: 'degraded', database: 'down' },
  }),
  false,
);

assert.strictEqual(
  isHealthPayloadReady(normalizeHealthPayload({ status: 'ok', database: 'up' })),
  true,
);

console.log('health-parse.test.js: ok');
