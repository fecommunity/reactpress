// @ts-nocheck
const fs = require('fs');
const path = require('path');

/** Normalize user input (e.g. api.gaoredu.com) to an HTTPS origin without trailing slash. */
function normalizeRemoteOrigin(input) {
  const raw = typeof input === 'string' ? input.trim() : '';
  if (!raw) return null;

  let origin = raw;
  if (!/^https?:\/\//i.test(origin)) {
    origin = `https://${origin}`;
  }
  return origin.replace(/\/$/, '');
}

function readEnvValue(projectRoot, key) {
  const envPath = path.join(projectRoot, '.env');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(new RegExp(`^${key}=(.+)$`, 'm'));
    if (match) {
      return match[1].trim().replace(/^['"]|['"]$/g, '');
    }
  } catch {
    // ignore
  }
  return null;
}

function readOriginFromEnv(projectRoot, envKey) {
  const fromShell = normalizeRemoteOrigin(process.env[envKey]);
  if (fromShell) return fromShell;
  return normalizeRemoteOrigin(readEnvValue(projectRoot, envKey));
}

/** Default remote API URL (--remote-origin or REACTPRESS_DEV_REMOTE_ORIGIN). */
function readDevRemoteDefault(projectRoot) {
  return readOriginFromEnv(projectRoot, 'REACTPRESS_DEV_REMOTE_ORIGIN');
}

/** @deprecated use readDevClientApiOrigin */
function readDevRemoteOrigin(projectRoot) {
  return readDevClientApiOrigin(projectRoot);
}

/** Remote admin API origin; null = local Nest. */
function readDevAdminApiOrigin(projectRoot) {
  return readOriginFromEnv(projectRoot, 'REACTPRESS_DEV_ADMIN_API_ORIGIN');
}

/** Remote client/theme API origin (nginx /api); null = local Nest. */
function readDevClientApiOrigin(projectRoot) {
  return readOriginFromEnv(projectRoot, 'REACTPRESS_DEV_CLIENT_API_ORIGIN');
}

/**
 * Parse one origin flag: local | remote | URL/host.
 * @returns {{ url: string|null } | { error: string }}
 */
function parseOriginSpec(value, remoteDefault) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) return { url: null };

  const lower = trimmed.toLowerCase();
  if (lower === 'local') return { url: null };
  if (lower === 'remote') {
    if (!remoteDefault) return { error: 'REMOTE_DEFAULT_REQUIRED' };
    return { url: remoteDefault };
  }

  const url = normalizeRemoteOrigin(trimmed);
  if (!url) return { error: 'INVALID_ORIGIN' };
  return { url };
}

/**
 * Resolve admin/client API targets for this dev session.
 * @returns {{ admin: string|null, client: string|null, remoteDefault: string|null, needsLocalApi: boolean, error?: string }}
 */
function resolveDevApiOrigins(projectRoot, cli = {}) {
  const remoteDefault =
    normalizeRemoteOrigin(cli.remoteOrigin) || readDevRemoteDefault(projectRoot);

  const onlyRemoteShorthand =
    cli.remoteOrigin !== undefined &&
    cli.adminOrigin === undefined &&
    cli.clientOrigin === undefined;

  const resolveSide = (cliValue, envKey, useRemoteShorthand) => {
    if (cliValue !== undefined) {
      return parseOriginSpec(cliValue, remoteDefault);
    }
    const fromEnv = readOriginFromEnv(projectRoot, envKey);
    if (fromEnv) return { url: fromEnv };
    if (useRemoteShorthand && remoteDefault) return { url: remoteDefault };
    return { url: null };
  };

  const adminParsed = resolveSide(
    cli.adminOrigin,
    'REACTPRESS_DEV_ADMIN_API_ORIGIN',
    onlyRemoteShorthand,
  );
  if (adminParsed.error) return { error: adminParsed.error };

  const clientParsed = resolveSide(
    cli.clientOrigin,
    'REACTPRESS_DEV_CLIENT_API_ORIGIN',
    onlyRemoteShorthand,
  );
  if (clientParsed.error) return { error: clientParsed.error };

  const admin = adminParsed.url;
  const client = clientParsed.url;

  return {
    admin,
    client,
    remoteDefault,
    needsLocalApi: !admin || !client,
  };
}

function applyDevApiOriginsToEnv(origins) {
  if (origins.remoteDefault) {
    process.env.REACTPRESS_DEV_REMOTE_ORIGIN = origins.remoteDefault;
  } else {
    delete process.env.REACTPRESS_DEV_REMOTE_ORIGIN;
  }

  if (origins.admin) {
    process.env.REACTPRESS_DEV_ADMIN_API_ORIGIN = origins.admin;
  } else {
    delete process.env.REACTPRESS_DEV_ADMIN_API_ORIGIN;
  }

  if (origins.client) {
    process.env.REACTPRESS_DEV_CLIENT_API_ORIGIN = origins.client;
  } else {
    delete process.env.REACTPRESS_DEV_CLIENT_API_ORIGIN;
  }
}

/** @deprecated use resolveDevApiOrigins */
function applyDevRemoteOrigin(cliValue) {
  const normalized = normalizeRemoteOrigin(cliValue);
  if (normalized) {
    process.env.REACTPRESS_DEV_REMOTE_ORIGIN = normalized;
    process.env.REACTPRESS_DEV_ADMIN_API_ORIGIN = normalized;
    process.env.REACTPRESS_DEV_CLIENT_API_ORIGIN = normalized;
  }
  return normalized;
}

/** Nest client base URL (includes /api when origin is host-only). */
function resolveRemoteThemeApiBase(origin) {
  const base = origin.replace(/\/$/, '');
  if (/\/api$/i.test(base)) return base;
  return `${base}/api`;
}

module.exports = {
  normalizeRemoteOrigin,
  readDevRemoteDefault,
  readDevRemoteOrigin,
  readDevAdminApiOrigin,
  readDevClientApiOrigin,
  parseOriginSpec,
  resolveDevApiOrigins,
  applyDevApiOriginsToEnv,
  applyDevRemoteOrigin,
  resolveRemoteThemeApiBase,
};
