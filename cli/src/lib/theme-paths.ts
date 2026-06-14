// @ts-nocheck
const path = require('path');

/** Shared path and id constants for theme runtime, registry, and server bridge. */
const REACTPRESS_DIR = '.reactpress';
const THEMES_DIR = 'themes';

const THEME_RUNTIME_REL = path.join(REACTPRESS_DIR, 'runtime');
const LEGACY_THEMES_RUNTIME_REL = path.join(THEMES_DIR, 'runtime');
const ACTIVE_THEME_MANIFEST_REL = path.join(REACTPRESS_DIR, 'active-theme.json');
const PREVIEW_THEME_MANIFEST_REL = path.join(REACTPRESS_DIR, 'preview-theme.json');
const PREVIEW_POOL_MANIFEST_REL = path.join(REACTPRESS_DIR, 'preview-pool.json');
const THEME_LOCK_REL = path.join(REACTPRESS_DIR, 'themes.lock.json');

const THEMES_PACKAGE_REL = path.join(THEMES_DIR, 'package.json');
const THEMES_CATALOG_REL = path.join(THEMES_DIR, 'catalog.json');
const CLI_CATALOG_TEMPLATE_REL = path.join('cli', 'templates', 'theme-catalog.json');

/** Reserved under `themes/` — not bundled templates or theme source trees. */
const THEMES_RESERVED_SUBDIRS = ['starter', 'bundled', 'core', 'theme-starter'];
const THEMES_LEGACY_STARTER_SUBDIRS = ['starter', 'bundled', 'core'];

const THEME_ID_RE = /^[a-z0-9][a-z0-9-]*$/i;
const DEFAULT_ACTIVE_THEME = 'hello-world';
const PREVIEW_PROXY_PORT = 3003;
const PREVIEW_BACKEND_BASE = 3004;
const DEFAULT_PREVIEW_POOL_MAX = 3;

function getPreviewPoolMaxSize() {
  const parsed = parseInt(process.env.REACTPRESS_PREVIEW_POOL_MAX || '', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_PREVIEW_POOL_MAX;
}

function getPreviewProxyPort() {
  const parsed = parseInt(process.env.REACTPRESS_PREVIEW_PORT || '', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : PREVIEW_PROXY_PORT;
}

function getPreviewBackendPorts() {
  const max = getPreviewPoolMaxSize();
  const parsed = parseInt(process.env.REACTPRESS_PREVIEW_BACKEND_BASE || '', 10);
  const base = Number.isInteger(parsed) && parsed > 0 ? parsed : PREVIEW_BACKEND_BASE;
  return Array.from({ length: max }, (_, index) => base + index);
}

/** Public preview URL port (proxy). Backend slots use getPreviewBackendPorts(). */
const PREVIEW_POOL_PORTS = [PREVIEW_PROXY_PORT];

function themesRoot(projectRoot) {
  return path.join(path.resolve(projectRoot), THEMES_DIR);
}

function runtimeRoot(projectRoot) {
  return path.join(path.resolve(projectRoot), THEME_RUNTIME_REL);
}

module.exports = {
  REACTPRESS_DIR,
  THEMES_DIR,
  THEME_RUNTIME_REL,
  LEGACY_THEMES_RUNTIME_REL,
  ACTIVE_THEME_MANIFEST_REL,
  PREVIEW_THEME_MANIFEST_REL,
  PREVIEW_POOL_MANIFEST_REL,
  THEME_LOCK_REL,
  THEMES_PACKAGE_REL,
  THEMES_CATALOG_REL,
  CLI_CATALOG_TEMPLATE_REL,
  THEMES_RESERVED_SUBDIRS,
  THEMES_LEGACY_STARTER_SUBDIRS,
  THEME_ID_RE,
  DEFAULT_ACTIVE_THEME,
  PREVIEW_PROXY_PORT,
  PREVIEW_BACKEND_BASE,
  DEFAULT_PREVIEW_POOL_MAX,
  PREVIEW_POOL_PORTS,
  getPreviewPoolMaxSize,
  getPreviewProxyPort,
  getPreviewBackendPorts,
  themesRoot,
  runtimeRoot,
};
