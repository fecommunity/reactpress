import type { ThemeMods } from '@fecommunity/reactpress-toolkit/theme';
import { randomBytes } from 'crypto';

export type PreviewDraftRecord = {
  themeId?: string;
  mods?: ThemeMods;
  configuration?: Record<string, unknown>;
  createdAt: number;
};

const TTL_MS = 30 * 60 * 1000;
const store = new Map<string, PreviewDraftRecord>();

function prune(): void {
  const now = Date.now();
  for (const [token, item] of store) {
    if (now - item.createdAt > TTL_MS) store.delete(token);
  }
}

export function putPreviewDraft(payload: {
  themeId?: string;
  mods?: ThemeMods;
  configuration?: Record<string, unknown>;
}): string {
  prune();
  const token = randomBytes(16).toString('hex');
  store.set(token, {
    themeId: payload.themeId,
    mods: payload.mods,
    configuration: payload.configuration,
    createdAt: Date.now(),
  });
  return token;
}

export function getPreviewDraft(token: string): PreviewDraftRecord | null {
  if (!token?.trim()) return null;
  prune();
  const item = store.get(token.trim());
  if (!item) return null;
  if (Date.now() - item.createdAt > TTL_MS) {
    store.delete(token.trim());
    return null;
  }
  return item;
}
