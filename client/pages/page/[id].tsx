import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useContext, useEffect } from 'react';

import { ArticleRecommend } from '@/components/ArticleRecommend';
import { Comment } from '@/components/Comment';
import { ImageViewer } from '@/components/ImageViewer';
import { MarkdownReader } from '@/components/MarkdownReader';
import { GlobalContext } from '@/context/global';
import { PageProvider } from '@/providers/page';

import style from './index.module.scss';

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
                <img src={page.cover} alt={t('articleCover') as string} />
              </div>
            )}
            <div className={style.content}>
              <MarkdownReader content={page.html} />
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
