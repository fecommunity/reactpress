import { ArticleList } from '@components/ArticleList';
import { Categories } from '@components/Categories';
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
import { TagProvider } from '@/providers/tag';

import { defaultImgSrc } from '@/assets/LogoSvg';
import AboutUs from '@/components/AboutUs';
import style from '../index.module.scss';

interface IProps {
  articles: IArticle[];
  total: number;
  tag: ITag;
}

const pageSize = 12;

const Home: NextPage<IProps> = ({ articles: defaultArticles = [], total, tag }) => {
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
      ArticleProvider.getArticlesByTag(tag.value, {
        page,
        pageSize,
        status: 'publish',
      }).then((res) => {
        setPage(page);
        setArticles((articles) => [...articles, ...res[0]]);
      });
    },
    [tag.value]
  );

  return (
    <div className={style.wrapper}>
      <DoubleColumnLayout
        leftNode={
          <>
            <Head>
              <title>{`${tag.label} - ${t('tagTitle')} - ${setting.systemTitle}`}</title>
            </Head>
            <div className={style.tagOrCategoryDetail} style={{ backgroundImage: `url(${bgImg})` }}>
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
            <Categories categories={categories} />
            <AboutUs className={style.footer} setting={setting} />
          </div>
        }
      />
    </div>
  );
};

// 服务端预取数据
Home.getInitialProps = async (ctx) => {
  const { tag: tagValue } = ctx.query;
  const [articles, tag] = await Promise.all([
    ArticleProvider.getArticlesByTag(tagValue, {
      page: 1,
      pageSize,
      status: 'publish',
    }),
    TagProvider.getTagById(tagValue),
  ]);
  return {
    articles: articles[0],
    total: articles[1],
    tag: tag,
    needLayoutFooter: false,
  };
};

export default Home;
