/**
 * macOS dev: copy Electron.app → .dev-app/ReactPress.app and patch Info.plist
 * so Dock hover text shows "ReactPress" instead of "Electron".
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const APP_NAME = "ReactPress";
const BUNDLE_ID = "com.reactpress.desktop.dev";

function plistSet(plistPath, key, value) {
  const result = spawnSync(
    "/usr/libexec/PlistBuddy",
    ["-c", `Set :${key} ${value}`, plistPath],
    { stdio: "pipe" },
  );
  if (result.status !== 0) {
    throw new Error(
      `PlistBuddy failed for ${key}: ${result.stderr?.toString() || result.status}`,
    );
  }
}

export function prepareMacDevApp(desktopRoot) {
  const require = createRequire(path.join(desktopRoot, "package.json"));
  const electronPkgDir = path.dirname(require.resolve("electron/package.json"));
  const electronVersion = require("electron/package.json").version;
  const sourceApp = path.join(electronPkgDir, "dist", "Electron.app");
  const devAppDir = path.join(desktopRoot, ".dev-app");
  const targetApp = path.join(devAppDir, `${APP_NAME}.app`);
  const markerFile = path.join(devAppDir, ".electron-version");

  if (!fs.existsSync(sourceApp)) {
    throw new Error(`Electron.app not found: ${sourceApp}`);
  }

  const needsRefresh =
    !fs.existsSync(targetApp) ||
    !fs.existsSync(markerFile) ||
    fs.readFileSync(markerFile, "utf8").trim() !== electronVersion;

  if (needsRefresh) {
    fs.rmSync(devAppDir, { recursive: true, force: true });
    fs.mkdirSync(devAppDir, { recursive: true });

    const copy = spawnSync("cp", ["-R", sourceApp, targetApp], { stdio: "inherit" });
    if (copy.status !== 0) {
      throw new Error("Failed to copy Electron.app for macOS dev");
    }

    const plistPath = path.join(targetApp, "Contents/Info.plist");
    plistSet(plistPath, "CFBundleDisplayName", APP_NAME);
    plistSet(plistPath, "CFBundleName", APP_NAME);
    plistSet(plistPath, "CFBundleIdentifier", BUNDLE_ID);

    fs.writeFileSync(markerFile, `${electronVersion}\n`);
  }

  return path.join(targetApp, "Contents/MacOS/Electron");
}
