// @ts-nocheck
/**
 * Parse `/api/health` JSON — supports raw Nest payload and TransformInterceptor wrapper.
 */

function normalizeHealthPayload(body) {
  if (!body || typeof body !== 'object') return null;
  if (
    body.data &&
    typeof body.data === 'object' &&
    (Object.prototype.hasOwnProperty.call(body.data, 'status') ||
      Object.prototype.hasOwnProperty.call(body.data, 'database'))
  ) {
    return body.data;
  }
  return body;
}

function isHealthPayloadReady(payload) {
  if (!payload || typeof payload !== 'object') return false;
  if (Object.prototype.hasOwnProperty.call(payload, 'database')) {
    return payload.status === 'ok' && payload.database === 'up';
  }
  return payload.status === 'ok' || payload.status === 'OK';
}

function isHealthHttpReady(statusCode, body) {
  if (statusCode !== 200) return false;
  return isHealthPayloadReady(normalizeHealthPayload(body));
}

module.exports = {
  normalizeHealthPayload,
  isHealthPayloadReady,
  isHealthHttpReady,
};
