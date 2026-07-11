import * as path from 'path';

const ALLOWED_MODULE_EXTENSIONS = new Set(['.js', '.cjs', '.mjs']);

/** Relative server entry path inside the plugin runtime directory (no `..`, no absolute paths). */
export function isSafePluginModuleRel(moduleRel: string): boolean {
  if (typeof moduleRel !== 'string' || !moduleRel.trim()) return false;
  if (path.isAbsolute(moduleRel)) return false;
  if (moduleRel.includes('\0')) return false;

  const normalized = moduleRel.replace(/^\.\//, '').replace(/\\/g, '/');
  const segments = normalized.split('/');
  if (segments.some((segment) => segment === '..')) return false;
  if (segments.some((segment) => segment === '.')) return false;

  return segments.every((segment) => segment.length > 0);
}

/**
 * Resolve `server.module` under the plugin root and ensure the result cannot escape it.
 * Returns `null` when the path is unsafe or uses a disallowed extension.
 */
export function resolvePluginServerModulePath(
  pluginRoot: string,
  moduleRel: string,
): string | null {
  if (!isSafePluginModuleRel(moduleRel)) return null;

  const rel = moduleRel.replace(/^\.\//, '');
  const root = path.resolve(pluginRoot);
  const resolved = path.resolve(root, rel);

  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    return null;
  }

  const ext = path.extname(resolved).toLowerCase();
  if (!ext || !ALLOWED_MODULE_EXTENSIONS.has(ext)) {
    return null;
  }

  return resolved;
}
