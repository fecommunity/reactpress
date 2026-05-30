/** Single site-wide notice (stored in `Setting.systemNoticeInfo` as JSON). */
export type SiteNoticeItem = {
  id: string;
  content: string;
  /** Default true when omitted. */
  enabled?: boolean;
};

function newNoticeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `notice-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeItem(raw: unknown, index: number): SiteNoticeItem | null {
  if (typeof raw === 'string') {
    const content = raw.trim();
    if (!content) return null;
    return { id: `legacy-${index}`, content, enabled: true };
  }
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const content = typeof o.content === 'string' ? o.content : typeof o.text === 'string' ? o.text : '';
  if (!content.trim()) return null;
  const id = typeof o.id === 'string' && o.id.trim() ? o.id.trim() : newNoticeId();
  const enabled = o.enabled === false ? false : true;
  return { id, content, enabled };
}

/**
 * Parse `systemNoticeInfo` from DB / API.
 * Supports JSON array, legacy newline-separated text, or plain string.
 */
export function parseSiteNotices(raw: unknown): SiteNoticeItem[] {
  if (raw == null) return [];

  if (Array.isArray(raw)) {
    return raw.map((item, i) => normalizeItem(item, i)).filter((x): x is SiteNoticeItem => x != null);
  }

  const text = String(raw).trim();
  if (!text) return [];

  if (text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((item, i) => normalizeItem(item, i)).filter((x): x is SiteNoticeItem => x != null);
      }
    } catch {
      /* fall through */
    }
  }

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((content, i) => ({ id: `legacy-${i}`, content, enabled: true }));
}

/** Persist notices for `Setting.systemNoticeInfo`. */
export function serializeSiteNotices(items: SiteNoticeItem[]): string {
  const cleaned = items
    .map((item) => ({
      id: item.id?.trim() || newNoticeId(),
      content: item.content?.trim() ?? '',
      enabled: item.enabled !== false,
    }))
    .filter((item) => item.content.length > 0);
  return JSON.stringify(cleaned);
}

/** Ordered notice HTML/text lines for the visitor banner (enabled only). */
export function siteNoticeDisplayLines(raw: unknown): string[] {
  return parseSiteNotices(raw)
    .filter((n) => n.enabled !== false)
    .map((n) => n.content);
}

export function createEmptySiteNotice(): SiteNoticeItem {
  return { id: newNoticeId(), content: '', enabled: true };
}

/** Whether theme mod `siteNotice` is empty or identical to system `systemNoticeInfo`. */
export function siteNoticeModInheritsSystem(
  modRaw: string | undefined,
  systemRaw: unknown,
): boolean {
  if (!modRaw?.trim()) return true;
  const modSerialized = serializeSiteNotices(parseSiteNotices(modRaw));
  const sysSerialized = serializeSiteNotices(parseSiteNotices(systemRaw));
  return modSerialized === sysSerialized;
}
