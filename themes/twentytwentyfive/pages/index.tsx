import { ArticleList } from '@components/ArticleList';
import dynamic from 'next/dynamic';

const ArticleCarousel = dynamic(() =>
  import('@components/ArticleCarousel').then((m) => m.ArticleCarousel),
);
const InfiniteScroll = dynamic(() => import('react-infinite-scroller'), { ssr: false });
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ArticleRecommend } from '@/components/ArticleRecommend';
import { SiteCatalogContext as GlobalContext } from '@fecommunity/reactpress-toolkit/theme';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import { ArticleProvider } from '@/providers';
import { getSiteTitle, resolveImageUrl } from '@fecommunity/reactpress-toolkit/theme';

import style from './index.module.scss';

const AboutUs = dynamic(() => import('@components/AboutUs'));
const Tags = dynamic(() => import('@/components/Tags').then((mod) => mod.Tags));

interface IHomeProps {
  articles: IArticle[];
  total: number;
  recommendedArticles: IArticle[];
}
const pageSize = 12;
export const CategoryMenu = ({ categories }) => {
  const t = useTranslations();
  const router = useRouter();
  const { asPath, pathname } = router;
  const isHome = pathname === '/';

  const selectedKey = useMemo(() => {
    if (isHome) return 'all';
    const active = categories.find((category) => asPath.replace('/category/', '') === category.value);
    return active?.value ?? '';
  }, [asPath, categories, isHome]);

  return (
    <nav className={style.menu} aria-label={t('categoryTitle')}>
      <ul className={style.menuList}>
        <li>
          <Link href="/" shallow={false}>
            <a className={selectedKey === 'all' ? style.active : undefined}>{t('all')}</a>
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.value}>
            <Link href="/category/[category]" as={`/category/${category.value}`} shallow={false}>
              <a className={selectedKey === category.value ? style.active : undefined}>{category.label}</a>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
const Home: NextPage<IHomeProps> = ({ articles: defaultArticles = [], recommendedArticles = [], total = 0 }) => {
  const t = useTranslations();
  const { setting, tags, categories } = useContext(GlobalContext);
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState<IArticle[]>(defaultArticles);
  useEffect(() => {
    setArticles(defaultArticles);
  }, [defaultArticles]);
  const getArticles = useCallback((page) => {
    ArticleProvider.getArticles({
      page,
      pageSize,
      status: 'publish',
    }).then((res) => {
      setPage(page);
      setArticles((articles) => [...articles, ...res[0]]);
    });
  }, []);
  const lcpCover = recommendedArticles.find((article) => article.cover)?.cover;
  const lcpCoverUrl = lcpCover ? resolveImageUrl(lcpCover, 'large') : null;
  return (
    <div className={style.wrapper}>
      <Head>
        <title>{getSiteTitle(setting)}</title>
        {lcpCoverUrl ? (
          <link rel="preload" as="image" href={lcpCoverUrl} fetchPriority="high" />
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
                <InfiniteScroll
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
                </InfiniteScroll>
              </main>
            </div>
          </>
        }
        rightNode={
          <div className="sticky">
            <ArticleRecommend mode="inline" />
            <Tags tags={tags} animationMode />
            <AboutUs className={style.footer} setting={setting} />
          </div>
        }
      />
    </div>
  );
};
// 服务端预取数据
Home.getInitialProps = async () => {
  const [articles, recommendedArticles] = await Promise.all([
    ArticleProvider.getArticles({ page: 1, pageSize, status: 'publish' }),
    ArticleProvider.getAllRecommendArticles().catch(() => []),
  ]);
  return {
    articles: articles[0],
    total: articles[1],
    recommendedArticles,
    needLayoutFooter: false,
  };
};
export default Home;
