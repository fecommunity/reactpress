import net from "node:net";

import { DEFAULT_LOCAL_API_PORT, DEV_INSTANCE_PORT_STEP } from "./constants";

export function readInstanceIndex(): number {
  const raw = process.env.REACTPRESS_INSTANCE ?? process.env.REACTPRESS_DEV_INSTANCE ?? "0";
  const n = parseInt(String(raw).trim(), 10);
  if (!Number.isInteger(n) || n < 0 || n > 99) return 0;
  return n;
}

export function instancePortOffset(): number {
  return readInstanceIndex() * DEV_INSTANCE_PORT_STEP;
}

export function readProcessEnvPort(key: string): number | null {
  const raw = process.env[key]?.trim();
  if (!raw) return null;
  const n = parseInt(raw.replace(/^['"]|['"]$/g, ""), 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Preferred local API port: explicit env → instance offset → default 3002. */
export function resolvePreferredLocalApiPort(): number {
  return (
    readProcessEnvPort("REACTPRESS_LOCAL_API_PORT") ??
    readProcessEnvPort("SERVER_PORT") ??
    DEFAULT_LOCAL_API_PORT + instancePortOffset()
  );
}

export function isPortAvailable(port: number, host = "127.0.0.1"): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, host);
  });
}

export async function findAvailablePort(
  startPort: number,
  maxAttempts = 20,
): Promise<number> {
  for (let port = startPort; port < startPort + maxAttempts; port += 1) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port in range ${startPort}-${startPort + maxAttempts - 1}`);
}
