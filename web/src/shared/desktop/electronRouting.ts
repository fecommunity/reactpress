/** True when the admin SPA is loaded from a packaged Electron `file://` page. */
export function isElectronFileProtocol(): boolean {
  return typeof window !== "undefined" && window.location.protocol === "file:";
}
