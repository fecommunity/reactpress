import AboutUs from '@components/AboutUs';
import { ArticleCarousel } from '@components/ArticleCarousel';
import { ArticleList } from '@components/ArticleList';
import { Tags } from '@components/Tags';
import { Menu } from 'antd';
import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import { ArticleRecommend } from '@/components/ArticleRecommend';
import { GlobalContext } from '@/context/global';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import { ArticleProvider } from '@/providers/article';
import { getSiteTitle } from '@/utils/seo';

import style from './index.module.scss';

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

  const menuItems = useMemo(
    () => [
      {
        key: 'all',
        label: (
          <Link href="/" shallow={false}>
            <a aria-label={t('all')}>
              <span>{t('all')}</span>
            </a>
          </Link>
        ),
      },
      ...categories.map((category) => ({
        key: category.value,
        label: (
          <Link href="/category/[category]" as={`/category/${category.value}`} shallow={false}>
            <a aria-label={category.label}>
              <span>{category.label}</span>
            </a>
          </Link>
        ),
      })),
    ],
    [categories, t],
  );

  return (
    <Menu mode="horizontal" className={style.menu} selectedKeys={selectedKey ? [selectedKey] : []} items={menuItems} />
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
  return (
    <div className={style.wrapper}>
      <Head>
        <title>{getSiteTitle(setting)}</title>
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
