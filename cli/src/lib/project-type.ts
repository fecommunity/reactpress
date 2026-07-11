// @ts-nocheck
const fs = require('fs');
const path = require('path');

/**
 * Decide whether a given directory is a ReactPress monorepo checkout (with
 * editable `server/src`, `web/`, `client/`, `toolkit/`) or a standalone project that
 * was created with `reactpress init` and relies on the bundled runtime.
 *
 * @param {string} root absolute project root
 * @returns {'monorepo' | 'standalone' | 'unknown'}
 */
function detectProjectType(root) {
  if (!root) return 'unknown';
  const abs = path.resolve(root);

  const monorepoMarkers = [
    path.join(abs, 'pnpm-workspace.yaml'),
    path.join(abs, 'server', 'src', 'main.ts'),
  ];
  if (monorepoMarkers.some((p) => fs.existsSync(p))) {
    return 'monorepo';
  }

  if (fs.existsSync(path.join(abs, '.reactpress', 'config.json'))) {
    return 'standalone';
  }

  return 'unknown';
}

/**
 * @param {string} root
 */
function hasClient(root) {
  return fs.existsSync(path.join(root, 'client', 'package.json'));
}

/**
 * Admin SPA (`web/`), preferred over client `/admin` in monorepo dev.
 * @param {string} root
 */
function hasWeb(root) {
  return fs.existsSync(path.join(root, 'web', 'package.json'));
}

/**
 * @param {string} root
 */
function hasServerSource(root) {
  return fs.existsSync(path.join(root, 'server', 'src', 'main.ts'));
}

/**
 * @param {string} root
 */
function hasToolkit(root) {
  return fs.existsSync(path.join(root, 'toolkit', 'package.json'));
}

/**
 * Electron desktop client (`desktop/`).
 * @param {string} root
 */
function hasDesktop(root) {
  return fs.existsSync(path.join(root, 'desktop', 'package.json'));
}

/**
 * Official plugins workspace (`plugins/`).
 * @param {string} root
 */
function hasPluginsWorkspace(root) {
  return fs.existsSync(path.join(root, 'plugins', 'package.json'));
}

/**
 * @param {string} root
 */
function describeProject(root) {
  const type = detectProjectType(root);
  return {
    type,
    root,
    hasClient: hasClient(root),
    hasWeb: hasWeb(root),
    hasServerSource: hasServerSource(root),
    hasToolkit: hasToolkit(root),
    hasDesktop: hasDesktop(root),
    hasPluginsWorkspace: hasPluginsWorkspace(root),
  };
}

module.exports = {
  detectProjectType,
  describeProject,
  hasClient,
  hasWeb,
  hasServerSource,
  hasToolkit,
  hasDesktop,
  hasPluginsWorkspace,
};
