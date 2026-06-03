import { ArticleList } from '@components/ArticleList';
import { CategoryMenu } from '@/components/CategoryMenu';
import dynamic from 'next/dynamic';
import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslations } from 'next-intl';
import { useCallback, useContext, useEffect, useState } from 'react';

import { LoadMore } from '@/components/LoadMore';
import { SiteCatalogContext as GlobalContext } from '@fecommunity/reactpress-toolkit/theme';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import { ArticleProvider } from '@/providers';
import { getSiteTitle, resolveImageUrl } from '@fecommunity/reactpress-toolkit/theme';
import {
  slimArticlesForList,
  type CarouselArticle,
  type ListArticle,
} from '@/utils/articleList';
import { resolveHomeCarouselArticles } from '@/utils/carouselArticles';

import style from './index.module.scss';

const ArticleCarousel = dynamic(() =>
  import('@components/ArticleCarousel').then((m) => m.ArticleCarousel),
);
const HomeSidebar = dynamic(() => import('@/components/HomeSidebar').then((m) => m.HomeSidebar));

interface IHomeProps {
  articles: ListArticle[];
  total: number;
  recommendedArticles: CarouselArticle[];
}
const pageSize = 12;

const Home: NextPage<IHomeProps> = ({ articles: defaultArticles = [], recommendedArticles = [], total = 0 }) => {
  const t = useTranslations();
  const { setting, tags, categories } = useContext(GlobalContext);
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState<ListArticle[]>(defaultArticles);

  useEffect(() => {
    setArticles(defaultArticles);
    setPage(1);
  }, [defaultArticles]);

  const getArticles = useCallback((nextPage: number) => {
    return ArticleProvider.getArticles({
      page: nextPage,
      pageSize,
      status: 'publish',
    }).then((res) => {
      setPage(nextPage);
      setArticles((prev) => [...prev, ...slimArticlesForList(res[0])]);
    });
  }, []);

  const lcpCover = recommendedArticles.find((article) => article.cover)?.cover;
  const lcpCoverUrl = lcpCover ? resolveImageUrl(lcpCover, 'large') : null;

  return (
    <div className={style.wrapper}>
      <Head>
        <title>{getSiteTitle(setting)}</title>
        {lcpCoverUrl ? (
          <link rel="preload" as="image" href={lcpCoverUrl} fetchpriority="high" />
        ) : null}
      </Head>
      <DoubleColumnLayout
        leftNode={
          <>
            {recommendedArticles?.some((article) => article.cover) ? (
              <div className={style.crouselWrap}>
                <ArticleCarousel articles={recommendedArticles} />
              </div>
            ) : null}
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
        rightNode={<HomeSidebar tags={tags} setting={setting} className={style.footer} />}
      />
    </div>
  );
};

Home.getInitialProps = async () => {
  const articles = await ArticleProvider.getArticles({ page: 1, pageSize, status: 'publish' });
  const rawArticles = articles[0];
  const recommendedArticles = await resolveHomeCarouselArticles(rawArticles);

  return {
    articles: slimArticlesForList(rawArticles),
    total: articles[1],
    recommendedArticles,
    needLayoutFooter: false,
  };
};

export default Home;
