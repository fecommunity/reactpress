/**
 * Next.js 12 resolves `typescript` from its own module path. In a pnpm monorepo
 * that can pick up TypeScript 5.x from the workspace root, which breaks with
 * `tsBinary.getMutableClone is not a function`. Pin resolution to this theme's TS 4.x.
 */
const Module = require('module');
const path = require('path');

const themeRoot = path.join(__dirname, '..');

let themeTypescriptEntry;
try {
  themeTypescriptEntry = require.resolve('typescript', { paths: [themeRoot] });
} catch {
  return;
}

const themeTsVersion = require(themeTypescriptEntry).version;
if (!themeTsVersion.startsWith('4.')) {
  console.warn(
    `[reactpress] Next.js 12 requires TypeScript 4.x in the theme package; found ${themeTsVersion}.`,
  );
}

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'typescript' || request.startsWith('typescript/')) {
    try {
      return originalResolveFilename.call(
        this,
        request,
        { paths: [themeRoot] },
        isMain,
        options,
      );
    } catch {
      // fall through to default resolution
    }
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};
