import dynamic from 'next/dynamic';
import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslations } from 'next-intl';
import { useContext, useEffect } from 'react';

import { ContentStylesLoader } from '@/components/ContentStylesLoader';
import { ArticleRecommend } from '@/components/ArticleRecommend';
import { ImageViewer, HtmlContent } from '@fecommunity/reactpress-toolkit/ui/content';
import { Image } from '@fecommunity/reactpress-toolkit/ui/content';
import { SiteCatalogContext as GlobalContext } from '@fecommunity/reactpress-toolkit/theme';
import { PageProvider } from '@/providers';

import style from './index.module.scss';

const Comment = dynamic(() => import('@/components/Comment').then((m) => m.Comment), { ssr: false });

interface IProps {
  page: IPage;
}

const Page: NextPage<IProps> = ({ page }) => {
  const t = useTranslations();
  const { setting } = useContext(GlobalContext);

  useEffect(() => {
    if (!page) {
      return;
    }
    PageProvider.updatePageViews(page.id);
  }, [page]);

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

Page.getInitialProps = async (ctx) => {
  const { id } = ctx.query;
  const page = await PageProvider.getPage(id);
  return { page };
};

export default Page;
