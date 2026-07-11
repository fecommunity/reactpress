export const CONFIG_FILE = "config.json";

export const APP_DISPLAY_NAME = "ReactPress";

/** Same as `SERVER_PORT` / `DEV_PORTS.API` in CLI — embedded SQLite API shares the standard API port. */
export const DEFAULT_LOCAL_API_PORT = 3002;

/** Port block step per `REACTPRESS_INSTANCE` (instance 1 → +10 on admin/visitor/api/preview). */
export const DEV_INSTANCE_PORT_STEP = 10;

/** Fallback when switching to remote without saved URL */
export const DEFAULT_REMOTE_API_BASE_URL = "http://127.0.0.1:3002/api";

export const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL?.trim() || "http://localhost:3000";

export const WINDOW_DEFAULTS = {
  width: 1280,
  height: 800,
  minWidth: 960,
  minHeight: 640,
} as const;
