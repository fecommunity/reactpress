import { getRoutePermissionMap } from './bootstrap';

export function normalizeAppPath(pathname: string): string {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '') || '/';
}

export function requiredPermissionForPath(pathname: string): string | null {
  const p = normalizeAppPath(pathname);
  const map = getRoutePermissionMap();
  if (p in map) return map[p] ?? null;

  if (p.startsWith('/settings/')) return 'setting:manage';
  if (p.startsWith('/plugins/') && p.endsWith('/settings')) return 'extension:manage';
  if (p.startsWith('/article/editor')) return 'article:write';
  if (p.startsWith('/page/editor')) return 'page:manage';

  return null;
}

export function canAccessPath(pathname: string, permissions: string[] | undefined): boolean {
  const required = requiredPermissionForPath(pathname);
  if (required == null) return true;
  if (!permissions?.length) return false;
  return permissions.includes(required);
}
