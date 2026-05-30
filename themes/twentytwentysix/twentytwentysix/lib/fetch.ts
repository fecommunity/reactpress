import type { ThemeApi } from '@fecommunity/reactpress-toolkit/theme';
import {
  safeJsonParse,
  themeApi,
  unpackList,
  unpackOne,
  unpackPaginated,
  unwrapSetting,
  withApiRetry,
  withThemeStaticProps,
} from '@fecommunity/reactpress-toolkit/theme';

export { themeApi, withThemeStaticProps };

export const HOME_PAGE_SIZE = 12;

export function unpackPaginatedMeta<T>(
  res: { data?: [T[], number] | T[] | unknown } | null | undefined,
): { items: T[]; total: number } {
  const payload = res?.data;
  if (Array.isArray(payload) && Array.isArray(payload[0])) {
    const total = typeof payload[1] === 'number' ? payload[1] : payload[0].length;
    return { items: payload[0] as T[], total };
  }
  return { items: [], total: 0 };
}

/** Paginated published articles for home infinite scroll. */
export async function fetchPublishedArticles(
  api: ThemeApi,
  page = 1,
  pageSize = HOME_PAGE_SIZE,
) {
  const res = await api.article.findAll({
    query: { page, pageSize, status: 'publish' },
  } as never);
  return unpackPaginatedMeta(res);
}

/** Paginated articles in a category. */
export async function fetchCategoryArticles(
  api: ThemeApi,
  category: string,
  page = 1,
  pageSize = HOME_PAGE_SIZE,
) {
  const res = await api.article.findArticlesByCategory(category, {
    query: { page, pageSize, status: 'publish' },
  } as never);
  return unpackPaginatedMeta(res);
}

/** Paginated articles with a tag. */
export async function fetchTagArticles(
  api: ThemeApi,
  tag: string,
  page = 1,
  pageSize = HOME_PAGE_SIZE,
) {
  const res = await api.article.findArticlesByTag(tag, {
    query: { page, pageSize, status: 'publish' },
  } as never);
  return unpackPaginatedMeta(res);
}

/** First page + total for category archive SSR. */
export async function fetchCategoryArchivePage(api: ThemeApi, category: string) {
  return withApiRetry(async () => {
    const [{ items, total }, categoriesRes] = await Promise.all([
      fetchCategoryArticles(api, category, 1, HOME_PAGE_SIZE),
      api.category.findAll(),
    ]);
    return {
      category,
      articles: items,
      articleTotal: total,
      categories: unpackList(categoriesRes),
    };
  });
}

/** First page + total for tag archive SSR. */
export async function fetchTagArchivePage(api: ThemeApi, tag: string) {
  return withApiRetry(async () => {
    const [{ items, total }, tagsRes] = await Promise.all([
      fetchTagArticles(api, tag, 1, HOME_PAGE_SIZE),
      api.tag.findAll(),
    ]);
    return {
      tag,
      articles: items,
      articleTotal: total,
      tags: unpackList(tagsRes),
    };
  });
}

export function flattenUrlNavItems(items: UrlNavCategory[]): UrlNavCategory[] {
  return items.flatMap((group) => (group.children?.length ? group.children : [group]));
}

export function findUrlNavItem(items: UrlNavCategory[], key: string): UrlNavCategory | null {
  return flattenUrlNavItems(items).find((item) => item.key === key) ?? null;
}

/** Article archives grouped by year → month (client `/archives`). */
export async function fetchArticleArchives(api: ThemeApi) {
  return withApiRetry(async () => {
    const res = await api.article.getArchives();
    return { archives: (unpackOne(res) ?? {}) as Record<string, Record<string, unknown[]>> };
  });
}

export function countArchiveArticles(archives: Record<string, Record<string, unknown[]>>): number {
  return Object.values(archives).reduce(
    (total, months) => total + Object.values(months).reduce((n, items) => n + items.length, 0),
    0,
  );
}

/** Home carousel / sidebar recommend list. */
export async function fetchRecommendArticles(api: ThemeApi) {
  return withApiRetry(async () => {
    const res = await api.article.getRecommendArticles();
    return { recommended: unpackList(res) };
  });
}

/** Published CMS pages for header nav. */
export async function fetchPublishedPages(api: ThemeApi) {
  return withApiRetry(async () => {
    const res = await api.page.findAll({
      query: { status: 'publish', page: 1, pageSize: 100 },
    } as never);
    const pages = unpackPaginated(res as never) as Array<{ path: string; name: string; order?: number }>;
    return {
      pages: [...pages].sort((a, b) => (b.order ?? 0) - (a.order ?? 0)),
    };
  });
}

/** Custom page by path slug (`/page/[id]` uses page.path). */
export async function fetchPageByPath(api: ThemeApi, pathSlug: string) {
  const page = unpackOne(await api.page.findById(pathSlug));
  return { page: page && (page as { status?: string }).status === 'publish' ? page : null };
}

/** Knowledge book list. */
export async function fetchKnowledgeList(api: ThemeApi) {
  return withApiRetry(async () => {
    const res = await api.knowledge.findAll({
      query: { status: 'publish', page: 1, pageSize: 24 },
    } as never);
    return { books: unpackPaginated(res) };
  });
}

/** Single knowledge book with tree. */
export async function fetchKnowledgeBook(api: ThemeApi, id: string) {
  const book = unpackOne(await api.knowledge.findById(id));
  return { book: book ?? null };
}

/** Knowledge chapter (nested under book). */
export async function fetchKnowledgeChapter(api: ThemeApi, bookId: string, chapterId: string) {
  const book = unpackOne(await api.knowledge.findById(bookId));
  if (!book) return { book: null, chapter: null };

  const children = (book as { children?: Array<{ id: string }> }).children ?? [];
  const chapter = children.find((c) => c.id === chapterId) ?? null;
  return { book, chapter };
}

export interface UrlNavCategory {
  label: string;
  key: string;
  description?: string;
  type?: string;
  url?: string;
  children?: UrlNavCategory[];
}

/** Parsed `globalSetting.globalConfig.urlConfig` for `/nav`. */
export async function fetchUrlNavConfig(api: ThemeApi) {
  return withApiRetry(async () => {
    const row = unwrapSetting(await api.setting.findAll());
    const globalSetting = safeJsonParse<{
      globalConfig?: { urlConfig?: UrlNavCategory[] };
    }>(row?.globalSetting, {});
    return { urlConfig: globalSetting?.globalConfig?.urlConfig ?? [] };
  });
}

export interface RssFeedInput {
  title: string;
  description: string;
  siteUrl: string;
  feedUrl: string;
  articles: Array<{
    title: string;
    html?: string;
    content?: string;
    id: string;
    publishAt?: string;
    category?: { label?: string };
  }>;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Minimal RSS 2.0 XML (replaces client/rss). */
export function buildRssXml(input: RssFeedInput): string {
  const items = input.articles
    .map((article) => {
      const link = `${input.siteUrl.replace(/\/$/, '')}/article/${article.id}`;
      const desc = article.html || article.content || '';
      return `<item>
  <title>${escapeXml(article.title)}</title>
  <link>${escapeXml(link)}</link>
  <guid>${escapeXml(link)}</guid>
  <description><![CDATA[${desc}]]></description>
  ${article.publishAt ? `<pubDate>${new Date(article.publishAt).toUTCString()}</pubDate>` : ''}
  ${article.category?.label ? `<category>${escapeXml(article.category.label)}</category>` : ''}
</item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(input.title)}</title>
  <link>${escapeXml(input.siteUrl)}</link>
  <description>${escapeXml(input.description)}</description>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  ${items}
</channel>
</rss>`;
}

export async function fetchRssFeedData(api: ThemeApi) {
  const row = unwrapSetting(await api.setting.findAll());
  const siteMeta = {
    title: row?.systemTitle ?? 'ReactPress',
    description: row?.seoDesc ?? row?.systemSubTitle ?? '',
    siteUrl: row?.systemUrl ?? 'http://localhost:3000',
  };
  const articles = unpackPaginated(
    await api.article.findAll({
      query: { page: 1, pageSize: 500, status: 'publish' },
    } as never),
  );
  return {
    ...siteMeta,
    feedUrl: `${siteMeta.siteUrl.replace(/\/$/, '')}/rss`,
    articles,
  };
}
