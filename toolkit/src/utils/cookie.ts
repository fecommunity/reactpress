import type { IncomingMessage } from 'http';

export function readRequestCookie(req: IncomingMessage | undefined, name: string): string | undefined {
  const header = req?.headers?.cookie ?? '';
  const match = new RegExp(`(?:^|;\\s*)${name}=([^;]*)`).exec(header);
  if (!match?.[1]) return undefined;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}
