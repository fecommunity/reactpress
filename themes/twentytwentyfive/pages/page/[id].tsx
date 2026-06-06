import {
  fetchCmsPageProps,
  themeApi,
  themeNotFound,
  themeOnDemandPaths,
  themeStaticProps,
  useSiteSetting,
  withApiRetry,
} from '@fecommunity/reactpress-toolkit/theme';
import dynamic from 'next/dynamic';
import type { GetStaticProps } from 'next';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { ContentStylesLoader } from '@/components/ContentStylesLoader';
import { ArticleRecommend } from '@/components/ArticleRecommend';
import { ImageViewer, HtmlContent } from '@fecommunity/reactpress-toolkit/ui/content';
import { Image } from '@fecommunity/reactpress-toolkit/ui/content';
import { PageProvider } from '@/providers';

import style from './index.module.scss';

const Comment = dynamic(() => import('@/components/Comment').then((m) => m.Comment), { ssr: false });

interface IProps {
  page: IPage;
}

export const getStaticPaths = () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps = async (ctx) => {
  const id = ctx.params?.id;
  if (typeof id !== 'string' || !id) return themeNotFound();

  try {
    const data = await withApiRetry(() => fetchCmsPageProps(themeApi, id));
    if (!data.page) return themeNotFound();
    return themeStaticProps({ page: data.page });
  } catch (error) {
    console.error('[reactpress] fetch cms page', error);
    return themeNotFound();
  }
};

const Page: NextPage<IProps> = ({ page }) => {
  const router = useRouter();
  const t = useTranslations();
  const setting = useSiteSetting();

  useEffect(() => {
    if (!page?.id) {
      return;
    }
    PageProvider.updatePageViews(page.id);
  }, [page]);

  if (router.isFallback || !page?.id) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <ImageViewer containerSelector="#js-page-wrapper">
      <ContentStylesLoader />
      <div id="js-page-wrapper" className={style.container}>
        <Head>
          <title>{page.name + ' - ' + setting.systemTitle}</title>
        </Head>
        <div
          style={{
            backgroundColor: !setting.systemBg ? 'var(--bg-second)' : 'transparent',
            borderBottom: !setting.systemBg ? '1px solid var(--border-color)' : 0,
            paddingTop: 21,
          }}
        >
          <div className="container">
            {page.cover && (
              <div className={style.coverWrapper}>
                <Image url={page.cover} size="large" alt={t('articleCover') as string} />
              </div>
            )}
            <div className={style.content}>
              <HtmlContent content={page.html} />
            </div>
          </div>
        </div>
        <div className={style.commentAndArticleWrapper}>
          <div className={style.comments}>
            <p className={style.title}>{t('comment')}</p>
            <div className={style.commentContainer}>
              <Comment key={page.id} hostId={page.id} />
            </div>
          </div>
          <div className={style.recmmendArticles}>
            <p className={style.title}>{t('recommendToReading')}</p>
            <div className={style.articleContainer}>
              <ArticleRecommend articleId={null} needTitle={false} />
            </div>
          </div>
        </div>
      </div>
    </ImageViewer>
  );
};

export default Page;
