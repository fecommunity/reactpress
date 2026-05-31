import { stripHtml, truncateWords } from '../../utils/string';

export type ArchiveExcerptMode = 'excerpt' | 'full' | 'none';

const DEFAULT_EXCERPT_WORD_LIMIT = 55;

export { stripHtml, truncateWords };

export interface ResolveArchiveExcerptOptions {
  mode?: ArchiveExcerptMode;
  content?: string | null;
  html?: string | null;
  summary?: string | null;
  wordLimit?: number;
}

/** Plain text from Markdown when only `content` is available (no rendered `html`). */
function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/^<!--[\s\S]*?-->$/gm, '')
    .replace(/^#+\s+.*$/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s+.*/gm, '')
    .replace(/^---$/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Resolve archive list excerpt text from customizer `archiveExcerpt` mode.
 * Returns `null` when the excerpt should be hidden.
 */
export function resolveArchiveExcerpt({
  mode = 'excerpt',
  content,
  html,
  summary,
  wordLimit = DEFAULT_EXCERPT_WORD_LIMIT,
}: ResolveArchiveExcerptOptions): string | null {
  if (mode === 'none') return null;

  const raw =
    summary?.trim() ||
    stripHtml(html ?? '') ||
    stripMarkdown(content ?? '') ||
    '';
  if (!raw) return null;
  if (mode === 'full') return raw;
  return truncateWords(raw, wordLimit);
}
