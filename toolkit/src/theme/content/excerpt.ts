import { stripHtml, truncateWords } from '../../utils/string';

export type ArchiveExcerptMode = 'excerpt' | 'full' | 'none';

const DEFAULT_EXCERPT_WORD_LIMIT = 55;

export { stripHtml, truncateWords };

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
