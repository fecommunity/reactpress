/** URL-friendly slug from title or custom alias. */
export function slugifyArticle(value: string): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function normalizeArticleSlug(value: unknown): string | null {
  const slug = slugifyArticle(String(value ?? ''));
  return slug || null;
}
