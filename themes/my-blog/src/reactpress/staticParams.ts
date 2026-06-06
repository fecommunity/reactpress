import {
  themeApi,
  unpackList,
  unpackPaginatedPair,
  withApiRetry,
} from '@fecommunity/reactpress-toolkit/theme/server';
import type { IArticle, ICategory, ITag } from '@fecommunity/reactpress-toolkit/types';

const STATIC_PARAM_LIMIT = 200;

export async function generateArticleStaticParams() {
  try {
    const response = await withApiRetry(() =>
      themeApi.article.findAll({
        query: { page: 1, pageSize: STATIC_PARAM_LIMIT, status: 'publish' },
      } as never),
    );
    const [articles] = unpackPaginatedPair<IArticle>(response);
    return articles.map((article) => ({ id: article.id }));
  } catch (error) {
    console.error('[my-blog] article static params failed', error);
    return [];
  }
}

export async function generateTagStaticParams() {
  try {
    const response = await withApiRetry(() => themeApi.tag.findAll());
    const tags = unpackList<ITag>(response).slice(0, STATIC_PARAM_LIMIT);
    return tags.map((tag) => ({ tag: tag.value }));
  } catch (error) {
    console.error('[my-blog] tag static params failed', error);
    return [];
  }
}

export async function generateCategoryStaticParams() {
  try {
    const response = await withApiRetry(() => themeApi.category.findAll());
    const categories = unpackList<ICategory>(response).slice(0, STATIC_PARAM_LIMIT);
    return categories.map((category) => ({ category: category.value }));
  } catch (error) {
    console.error('[my-blog] category static params failed', error);
    return [];
  }
}
