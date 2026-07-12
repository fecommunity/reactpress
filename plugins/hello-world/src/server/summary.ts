import type { ArticleDraft, SummaryPluginConfig } from './types';

function stripMarkdown(text: string): string {
  return String(text || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]*)]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/[*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 摘要为空时从正文（或标题）生成 summary。 */
export function applyAutoSummary(article: ArticleDraft, config: SummaryPluginConfig): ArticleDraft {
  if (!config.enabled) return article;

  const existing = String(article.summary ?? '').trim();
  if (existing) return article;

  const content = stripMarkdown(String(article.content ?? article.html ?? ''));
  const title = String(article.title ?? '').trim();
  const source = content || (config.fallbackToTitle ? title : '');
  if (!source) return article;

  const max = Math.max(40, config.maxLength);
  let summary = source.slice(0, max);
  if (source.length > max) summary += config.suffix;

  return { ...article, summary };
}
