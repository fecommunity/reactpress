import type { ThemeApi } from '../api/api';
import { themeApi } from '../api/api';
import { unpackList, unpackOne, unpackPaginatedPair } from '../api/api-data';
import {
  slimArticlesForList,
  type CarouselArticle,
  type ListArticle,
} from '../content/articleSlim';
import { slimArchiveTree, type ArchiveTree } from '../content/archiveSlim';
import { resolveCarouselArticles } from '../content/carouselArticles';
import { withApiRetry } from './fetch';
import type { IArticle, ICategory, IKnowledge, ITag } from '../../types';

export type HomePageProps = {
  articles: ListArticle[];
  total: number;
  recommendedArticles: CarouselArticle[];
};

export type CategoryArchivePageProps = {
  articles: ListArticle[];
  total: number;
  category: Pick<ICategory, 'value' | 'label'> & Partial<ICategory>;
};

export type TagArchivePageProps = {
  articles: ListArticle[];
  total: number;
  tag: Pick<ITag, 'value' | 'label'> & Partial<ITag>;
};

export type KnowledgeIndexPageProps = {
  books: IKnowledge[];
  total: number;
};

export type SearchPageProps = {
  keyword: string;
  articles: IArticle[];
};

const DEFAULT_PAGE_SIZE = 12;

function fallbackCategory(value: string): CategoryArchivePageProps['category'] {
  return { value, label: value };
}

function fallbackTag(value: string): TagArchivePageProps['tag'] {
  return { value, label: value };
}

/** Home / blog index — first page of articles + carousel recommendations. */
export async function fetchHomePageProps(
  api: ThemeApi = themeApi,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<HomePageProps> {
  return withApiRetry(async () => {
    const response = await api.article.findAll({
      query: { page: 1, pageSize, status: 'publish' },
    } as never);
    const [rawArticles, total] = unpackPaginatedPair<IArticle>(response);
    const recommendedArticles = await resolveCarouselArticles(rawArticles, {
      fetchRecommended: async () =>
        unpackList(await api.article.getRecommendArticles({} as never)) as IArticle[],
    });
    return {
      articles: slimArticlesForList(rawArticles),
      total,
      recommendedArticles,
    };
  });
}

/** Category archive — paginated list with taxonomy metadata. */
export async function fetchCategoryArchivePageProps(
  api: ThemeApi,
  categoryValue: string,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<CategoryArchivePageProps> {
  const [articlesResponse, categoryResponse] = await Promise.all([
    api.article.findArticlesByCategory(categoryValue, {
      query: { page: 1, pageSize, status: 'publish' },
    } as never),
    api.category.findById(categoryValue),
  ]);
  const [rawArticles, total] = unpackPaginatedPair<IArticle>(articlesResponse);
  const category = unpackOne<ICategory>(categoryResponse) ?? fallbackCategory(categoryValue);
  return {
    articles: slimArticlesForList(rawArticles),
    total,
    category,
  };
}

/** Tag archive — paginated list with taxonomy metadata. */
export async function fetchTagArchivePageProps(
  api: ThemeApi,
  tagValue: string,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<TagArchivePageProps> {
  const [articlesResponse, tagResponse] = await Promise.all([
    api.article.findArticlesByTag(tagValue, {
      query: { page: 1, pageSize, status: 'publish' },
    } as never),
    api.tag.findById(tagValue),
  ]);
  const [rawArticles, total] = unpackPaginatedPair<IArticle>(articlesResponse);
  const tag = unpackOne<ITag>(tagResponse) ?? fallbackTag(tagValue);
  return {
    articles: slimArticlesForList(rawArticles),
    total,
    tag,
  };
}

/** Archives tree — year/month grouped article index. */
export async function fetchArchivesPageProps(api: ThemeApi = themeApi): Promise<{ articles: ArchiveTree }> {
  const response = await api.article.getArchives({} as never);
  const raw =
    unpackOne<Record<string, Record<string, IArticle[]>>>(response as never) ??
    (response as unknown as Record<string, Record<string, IArticle[]>>);
  return {
    articles: slimArchiveTree(raw ?? {}),
  };
}

/** Knowledge library index — first page. */
export async function fetchKnowledgeIndexPageProps(
  api: ThemeApi = themeApi,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<KnowledgeIndexPageProps> {
  const response = await api.knowledge.findAll({
    query: { page: 1, pageSize, status: 'publish' },
  } as never);
  const [books, total] = unpackPaginatedPair<IKnowledge>(response);
  return { books, total };
}

/** Knowledge book detail with sibling books for sidebar. */
export async function fetchKnowledgeBookPageProps(api: ThemeApi, pId: string) {
  const [bookResponse, listResponse] = await Promise.all([
    api.knowledge.findById(pId),
    api.knowledge.findAll({ query: { page: 1, pageSize: 6, status: 'publish' } } as never),
  ]);
  const book = unpackOne<IKnowledge>(bookResponse);
  const [allBooks] = unpackPaginatedPair<IKnowledge>(listResponse);
  return {
    pId,
    book,
    otherBooks: book ? allBooks.filter((item: IKnowledge) => item.id !== book.id) : allBooks,
  };
}

/** Knowledge chapter detail. */
export async function fetchKnowledgeChapterPageProps(api: ThemeApi, pId: string, id: string) {
  const [bookResponse, chapterResponse] = await Promise.all([
    api.knowledge.findById(pId),
    api.knowledge.findById(id),
  ]);
  return {
    pId,
    book: unpackOne<IKnowledge>(bookResponse),
    id,
    chapter: unpackOne<IKnowledge>(chapterResponse),
  };
}

/** Site search results for `/search?keyword=`. */
export async function fetchSearchPageProps(
  api: ThemeApi,
  keyword: string,
): Promise<SearchPageProps> {
  const trimmed = keyword.trim();
  if (!trimmed) {
    return { keyword: '', articles: [] };
  }
  const response = await api.search.searchArticle({
    query: { keyword: trimmed },
  } as never);
  const articles = (unpackList(response) as IArticle[]).filter(
    (article) => article.status === 'publish',
  );
  return { keyword: trimmed, articles };
}

/** CMS static page by id. */
export async function fetchCmsPageProps(api: ThemeApi, id: string) {
  return { page: unpackOne(await api.page.findById(id)) };
}

/** Single article by id (full entity from API). */
export async function fetchArticleDetailProps(api: ThemeApi, id: string) {
  return { article: unpackOne<IArticle>(await api.article.findById(id)) };
}
