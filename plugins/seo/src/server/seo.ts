import type { ArticleDraft, SeoPluginConfig } from './types';
import { slugify } from './slug';

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

function truncate(text: string, max: number, suffix: string): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + suffix;
}

function collectTagLabels(tags: ArticleDraft['tags']): string[] {
  if (!tags) return [];
  const list = Array.isArray(tags) ? tags : String(tags).split(',');
  const labels: string[] = [];
  for (const item of list) {
    if (typeof item === 'string') {
      const label = item.trim();
      if (label) labels.push(label);
      continue;
    }
    if (item && typeof item === 'object') {
      const label = String(item.label ?? item.value ?? '').trim();
      if (label) labels.push(label);
    }
  }
  return labels;
}

function buildKeywords(title: string, tags: ArticleDraft['tags']): string {
  const parts = [title.trim(), ...collectTagLabels(tags)].filter(Boolean);
  const unique = [...new Set(parts.map((p) => p.replace(/\s+/g, ' ').trim()))];
  return unique.join(', ');
}

function buildDescription(article: ArticleDraft, config: SeoPluginConfig): string {
  const summary = String(article.summary ?? '').trim();
  if (summary) return summary;

  const content = stripMarkdown(String(article.content ?? article.html ?? ''));
  const title = String(article.title ?? '').trim();
  const source = content || title;
  if (!source) return '';

  const max = Math.max(80, config.descriptionMaxLength);
  return truncate(source, max, config.descriptionSuffix);
}

/** 补全 slug、seoKeywords、seoDescription。 */
export function applySeoDefaults(article: ArticleDraft, config: SeoPluginConfig): ArticleDraft {
  if (!config.enabled) return article;

  const next: ArticleDraft = { ...article };
  const title = String(article.title ?? '').trim();

  if (config.autoSlug && !String(article.slug ?? '').trim() && title) {
    next.slug = slugify(title) || null;
  }

  if (config.autoDescription && !String(article.seoDescription ?? '').trim()) {
    const description = buildDescription(article, config);
    if (description) next.seoDescription = description;
  }

  if (config.autoKeywords && !String(article.seoKeywords ?? '').trim() && title) {
    const keywords = buildKeywords(title, article.tags);
    if (keywords) next.seoKeywords = keywords;
  }

  return next;
}
