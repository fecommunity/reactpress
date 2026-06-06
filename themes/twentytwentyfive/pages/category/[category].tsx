import { ArticleList } from '@components/ArticleList';
import { Tags } from '@components/Tags';
import cls from 'classnames';
import type { GetStaticProps } from 'next';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { LoadMore } from '@/components/LoadMore';
import AboutUs from '@/components/AboutUs';
import { ArticleRecommend } from '@/components/ArticleRecommend';
import { CategoryMenu } from '@/components/CategoryMenu';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import { ArticleProvider } from '@/providers';
import {
  fetchCategoryArchivePageProps,
  slimArticlesForList,
  themeApi,
  themeNotFound,
  themeOnDemandPaths,
  themeStaticProps,
  useSiteCatalog,
  useSiteSetting,
  withApiRetry,
  type ListArticle,
} from '@fecommunity/reactpress-toolkit/theme';
import { getArchiveBannerImage } from '@/utils/archiveBanner';

import style from '../index.module.scss';

interface IProps {
  articles: ListArticle[];
  total: number;
  category: ICategory;
}

const pageSize = 12;

export const getStaticPaths = () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps = async (ctx) => {
  const categoryValue = ctx.params?.category;
  if (typeof categoryValue !== 'string' || !categoryValue) return themeNotFound();

  return withApiRetry(() => fetchCategoryArchivePageProps(themeApi, categoryValue, pageSize))
    .then((data) => themeStaticProps({ ...data, needLayoutFooter: false }))
    .catch((error) => {
      console.error('[reactpress] fetch category archive page', error);
      return themeStaticProps({
        articles: [],
        total: 0,
        category: { value: categoryValue, label: categoryValue },
        needLayoutFooter: false,
      });
    });
};

const CategoryPage: NextPage<IProps> = ({ articles: defaultArticles = [], total, category }) => {
  const router = useRouter();
  const t = useTranslations();
  const setting = useSiteSetting();
  const { tags, categories } = useSiteCatalog();
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState<ListArticle[]>(defaultArticles);
  const banner = getArchiveBannerImage(articles);

  useEffect(() => {
    setArticles(defaultArticles);
  }, [defaultArticles]);

  const getArticles = useCallback(
    (nextPage: number) => {
      if (!category?.value) return;
      ArticleProvider.getArticlesByCategory(category.value, {
        page: nextPage,
        pageSize,
        status: 'publish',
      }).then((res) => {
        setPage(nextPage);
        setArticles((prev) => [...prev, ...slimArticlesForList(res[0])]);
      });
    },
    [category?.value],
  );

  if (router.isFallback || !category?.value) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className={style.wrapper}>
      <Head>
        <title>{`${category?.label} - ${t('categoryArticle')} - ${setting.systemTitle}`}</title>
      </Head>
      <DoubleColumnLayout
        leftNode={
          <>
            <div
              className={cls(
                style.tagOrCategoryDetail,
                banner.isBrandFallback && style.tagOrCategoryDetailBrand,
              )}
              style={{ backgroundImage: `url(${banner.url})` }}
            >
              <p>
                <span>{category && category.label}</span> {t('categoryArticle')}
              </p>
              <p>
                {t('totalSearch')} <span>{total}</span> {t('piece')}
              </p>
            </div>
            <div className={style.leftWrap}>
              <header>
                <CategoryMenu categories={categories} />
              </header>
              <main>
                <LoadMore
                  pageStart={1}
                  loadMore={getArticles}
                  hasMore={page * pageSize < total}
                  loader={
                    <div className={'loading'} key={0}>
                      {t('gettingArticle')}
                    </div>
                  }
                >
                  <ArticleList articles={articles} />
                </LoadMore>
              </main>
            </div>
          </>
        }
        rightNode={
          <div className="sticky">
            <ArticleRecommend mode="inline" />
            <Tags tags={tags} />
            <AboutUs className={style.footer} setting={setting} />
          </div>
        }
      />
    </div>
  );
};

export default CategoryPage;
