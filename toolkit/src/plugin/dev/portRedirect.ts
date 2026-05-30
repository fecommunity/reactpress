const DEFAULT_NGINX_PORT = 80;

export type DevPortRole = 'visitor' | 'admin' | 'api';

function readPortEnv(key: string, fallback: number): number {
  const raw = process.env[key]?.trim();
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function resolveDevPortRole(directPort: number): DevPortRole {
  const apiPort = readPortEnv('SERVER_PORT', 3002);
  const adminPort = readPortEnv('WEB_ADMIN_PORT', 3000);
  if (directPort === apiPort) return 'api';
  if (directPort === adminPort) return 'admin';
  return 'visitor';
}

/** Unified nginx entry (:80) — dev (`REACTPRESS_NGINX_ENTRY_URL`) or prod (`NGINX_ENTRY_URL`). */
export function isUnifiedNginxEntryEnabled(): boolean {
  return Boolean(
    process.env.REACTPRESS_NGINX_ENTRY_URL?.trim() || process.env.NGINX_ENTRY_URL?.trim(),
  );
}

/** @deprecated Use {@link isUnifiedNginxEntryEnabled} */
export function isNginxDevRedirectEnabled(): boolean {
  return isUnifiedNginxEntryEnabled();
}

export function resolveNginxEntryUrl(): string {
  const override = process.env.REACTPRESS_NGINX_ENTRY_URL?.trim();
  if (override) {
    return override.replace(/\/$/, '');
  }

  const rawPort = process.env.NGINX_PORT?.trim();
  const port = rawPort ? parseInt(rawPort, 10) : DEFAULT_NGINX_PORT;
  if (Number.isFinite(port) && port > 0 && port !== DEFAULT_NGINX_PORT) {
    return `http://localhost:${port}`;
  }
  return 'http://localhost';
}

export function isDirectDevPortAccess(host: string | null | undefined, port: number): boolean {
  if (!host || !Number.isFinite(port) || port <= 0) return false;
  const normalized = host.toLowerCase();
  return (
    normalized === `localhost:${port}` ||
    normalized === `127.0.0.1:${port}` ||
    normalized === `[::1]:${port}`
  );
}

function acceptsHtmlNavigation(accept: string | null | undefined): boolean {
  if (!accept) return false;
  return accept.includes('text/html');
}

export interface DevPortRedirectOptions {
  host?: string | null;
  method?: string;
  accept?: string | null;
  directPort: number;
  pathname?: string;
  skipPathPrefixes?: string[];
}

export function shouldRedirectDevPortToNginx(options: DevPortRedirectOptions): boolean {
  if (process.env.REACTPRESS_SKIP_DEV_PORT_REDIRECT === '1') return false;
  if (!isUnifiedNginxEntryEnabled()) return false;

  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') return false;
  if (!isDirectDevPortAccess(options.host, options.directPort)) return false;
  if (!acceptsHtmlNavigation(options.accept)) return false;

  const pathname = options.pathname || '/';
  if (options.skipPathPrefixes?.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }

  return true;
}

export function buildDevPortRedirectUrl(options: {
  directPort: number;
  pathname?: string;
  search?: string;
  nginxEntryUrl?: string;
}): string {
  const entry = (options.nginxEntryUrl || resolveNginxEntryUrl()).replace(/\/$/, '');
  const pathname = options.pathname || '/';
  const search = options.search || '';
  const role = resolveDevPortRole(options.directPort);

  if (role === 'api') {
    if (pathname === '/' || pathname === '') {
      return `${entry}/api${search}`;
    }
    return `${entry}${pathname}${search}`;
  }

  if (role === 'admin') {
    let adminPath = pathname;
    if (!adminPath.startsWith('/admin')) {
      adminPath = adminPath === '/' ? '/admin/' : `/admin${adminPath.startsWith('/') ? adminPath : `/${adminPath}`}`;
    }
    return `${entry}${adminPath}${search}`;
  }

  return `${entry}${pathname}${search}`;
}
