export type ArchiveExcerptMode = 'excerpt' | 'full' | 'none';

const DEFAULT_EXCERPT_WORD_LIMIT = 55;

/** Strip HTML tags and collapse whitespace for archive excerpts. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Truncate text to a word limit with an ellipsis. */
export function truncateWords(text: string, limit = DEFAULT_EXCERPT_WORD_LIMIT): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= limit) return text.trim();
  return `${words.slice(0, limit).join(' ')}…`;
}

export interface ResolveArchiveExcerptOptions {
  mode?: ArchiveExcerptMode;
  content?: string | null;
  summary?: string | null;
  wordLimit?: number;
}

/**
 * Resolve archive list excerpt text from customizer `archiveExcerpt` mode.
 * Returns `null` when the excerpt should be hidden.
 */
export function resolveArchiveExcerpt({
  mode = 'excerpt',
  content,
  summary,
  wordLimit = DEFAULT_EXCERPT_WORD_LIMIT,
}: ResolveArchiveExcerptOptions): string | null {
  if (mode === 'none') return null;

  const raw = stripHtml(content ?? '') || summary?.trim() || '';
  if (!raw) return null;
  if (mode === 'full') return raw;
  return truncateWords(raw, wordLimit);
}
