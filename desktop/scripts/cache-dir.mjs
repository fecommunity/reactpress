/**
 * Desktop build/dev cache — keeps dot dirs out of desktop root.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopDir = path.resolve(__dirname, "..");

/** @param {string} name */
export function cachePath(name) {
  return path.join(desktopDir, ".cache", name);
}

export const CACHE_PATHS = {
  appResources: cachePath("app-resources"),
  serverBundle: cachePath("server-bundle"),
  themeBundle: cachePath("theme-bundle"),
  devApp: cachePath("dev-app"),
};
