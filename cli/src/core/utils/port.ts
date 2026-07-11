import net from 'node:net';

const DEFAULT_MAX_ATTEMPTS = 100;

export function isPortAvailable(port: number, host = '0.0.0.0'): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, host);
  });
}

export async function findAvailablePort(
  startPort: number,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
): Promise<number> {
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`在 ${startPort}-${startPort + maxAttempts - 1} 范围内未找到可用端口`);
}

export function isDockerPortBindError(output: string): boolean {
  return /port is already allocated|address already in use/i.test(output);
}
