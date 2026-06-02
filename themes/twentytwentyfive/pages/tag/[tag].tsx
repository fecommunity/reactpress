import { ArticleList } from '@components/ArticleList';
import { Categories } from '@components/Categories';
import { Tags } from '@components/Tags';
import cls from 'classnames';
import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslations } from 'next-intl';
import { useCallback, useContext, useEffect, useState } from 'react';

import { LoadMore } from '@/components/LoadMore';
import AboutUs from '@/components/AboutUs';
import { ArticleRecommend } from '@/components/ArticleRecommend';
import { SiteCatalogContext as GlobalContext } from '@fecommunity/reactpress-toolkit/theme';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import { ArticleProvider } from '@/providers';
import { TagProvider } from '@/providers';
import { getArchiveBannerImage } from '@/utils/archiveBanner';

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
  const banner = getArchiveBannerImage(articles);

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

// 服务端预取数据
Home.getInitialProps = async (ctx) => {
  const rawTag = ctx.query.tag;
  const tagValue = Array.isArray(rawTag) ? rawTag[0] : rawTag;
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
