import { ArticleList } from '@components/ArticleList';
import { Tags } from '@components/Tags';
import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useCallback, useContext, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import { ArticleRecommend } from '@/components/ArticleRecommend';
import { GlobalContext } from '@/context/global';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import { ArticleProvider } from '@/providers/article';
import { CategoryProvider } from '@/providers/category';

import { defaultImgSrc } from '@/assets/LogoSvg';
import AboutUs from '@/components/AboutUs';
import { CategoryMenu } from '../index';
import style from '../index.module.scss';

interface IProps {
  articles: IArticle[];
  total: number;
  category: ICategory;
}

const pageSize = 12;

const Home: NextPage<IProps> = ({ articles: defaultArticles = [], total, category }) => {
  const t = useTranslations();
  const { setting, tags, categories } = useContext(GlobalContext);
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState<IArticle[]>(defaultArticles);
  const bgImg = articles?.filter((article) => article.cover)?.[0]?.cover || defaultImgSrc;

  useEffect(() => {
    setArticles(defaultArticles);
  }, [defaultArticles]);

  const getArticles = useCallback(
    (page) => {
      ArticleProvider.getArticlesByCategory(category.value, {
        page,
        pageSize,
        status: 'publish',
      }).then((res) => {
        setPage(page);
        setArticles((articles) => [...articles, ...res[0]]);
      });
    },
    [category]
  );

  return (
    <div className={style.wrapper}>
      <Head>
        <title>{`${category?.label} - ${t('categoryArticle')} - ${setting.systemTitle}`}</title>
      </Head>
      <DoubleColumnLayout
        leftNode={
          <>
            <div className={style.tagOrCategoryDetail} style={{ backgroundImage: `url(${bgImg})` }}>
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
Home.getInitialProps = async (ctx) => {
  const { category: categoryValue } = ctx.query;
  const [articles, category] = await Promise.all([
    ArticleProvider.getArticlesByCategory(categoryValue, {
      page: 1,
      pageSize,
      status: 'publish',
    }),
    CategoryProvider.getCategoryById(categoryValue),
  ]);
  return {
    articles: articles[0],
    total: articles[1],
    category: category,
    needLayoutFooter: false,
  };
};

export default Home;
