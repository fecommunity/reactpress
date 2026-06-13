export const DEFAULT_API_BASE_URL = "http://127.0.0.1:3002/api";

export const WINDOW_DEFAULTS = {
  width: 1280,
  height: 800,
  minWidth: 960,
  minHeight: 640,
} as const;

export const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL?.trim() || "http://localhost:3000";

export const CONFIG_FILE = "config.json";
