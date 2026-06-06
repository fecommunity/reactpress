import { ArticleList } from '@components/ArticleList';
import { Categories } from '@components/Categories';
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
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import { ArticleProvider } from '@/providers';
import {
  fetchTagArchivePageProps,
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
  tag: ITag;
}

const pageSize = 12;

export const getStaticPaths = () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps = async (ctx) => {
  const tagValue = ctx.params?.tag;
  if (typeof tagValue !== 'string' || !tagValue) return themeNotFound();

  return withApiRetry(() => fetchTagArchivePageProps(themeApi, tagValue, pageSize))
    .then((data) => themeStaticProps({ ...data, needLayoutFooter: false }))
    .catch((error) => {
      console.error('[reactpress] fetch tag archive page', error);
      return themeStaticProps({
        articles: [],
        total: 0,
        tag: { value: tagValue, label: tagValue },
        needLayoutFooter: false,
      });
    });
};

const TagPage: NextPage<IProps> = ({ articles: defaultArticles = [], total, tag }) => {
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
      if (!tag?.value) return;
      ArticleProvider.getArticlesByTag(tag.value, {
        page: nextPage,
        pageSize,
        status: 'publish',
      }).then((res) => {
        setPage(nextPage);
        setArticles((prev) => [...prev, ...slimArticlesForList(res[0])]);
      });
    },
    [tag?.value],
  );

  if (router.isFallback || !tag?.value) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className={style.wrapper}>
      <DoubleColumnLayout
        leftNode={
          <>
            <Head>
              <title>{`${tag.label} - ${t('tagTitle')} - ${setting.systemTitle}`}</title>
            </Head>
            <div
              className={cls(
                style.tagOrCategoryDetail,
                banner.isBrandFallback && style.tagOrCategoryDetailBrand,
              )}
              style={{ backgroundImage: `url(${banner.url})` }}
            >
              <p>
                {t('yu')} <span>{tag.label}</span> {t('tagRelativeArticles')}
              </p>
              <p>
                {t('totalSearch')} <span>{total}</span> {t('piece')}
              </p>
            </div>
            <Tags tags={tags} />
            <div className={style.leftWrap}>
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
            <Categories categories={categories} />
            <AboutUs className={style.footer} setting={setting} />
          </div>
        }
      />
    </div>
  );
};

export default TagPage;
