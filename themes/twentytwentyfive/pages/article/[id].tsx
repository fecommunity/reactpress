import { ContentStylesLoader } from '@/components/ContentStylesLoader';
import { TagOutlined } from '@/icons';
import {
  HtmlContent,
  ImageViewer,
  LocaleTime,
  parseArticleToc,
} from '@fecommunity/reactpress-toolkit/ui/content';
import { Image } from '@fecommunity/reactpress-toolkit/ui/content';
import {
  fetchArticleDetailProps,
  resolveImageUrl,
  themeApi,
  themeNotFound,
  themeOnDemandPaths,
  themeStaticProps,
  useSiteCatalog,
  useSiteSetting,
  withApiRetry,
} from '@fecommunity/reactpress-toolkit/theme';
import { Form, Input, message, Modal } from '@/ui';
import type { GetStaticProps } from 'next';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { default as Router, useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ArticleRecommend } from '@/components/ArticleRecommend';
import { Toc } from '@/components/Toc';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import { ArticleProvider } from '@/providers';

import style from './index.module.scss';

const Comment = dynamic(() => import('@/components/Comment').then((m) => m.Comment), { ssr: false });
const url = require('url');

interface ArticlePageProps {
  article?: IArticle;
}

function ArticleLoading() {
  const t = useTranslations();
  return (
    <>
      <Head>
        <title>{t('loading')}</title>
      </Head>
      <div className="loading">{t('loading')}</div>
    </>
  );
}

function ArticleView({ article }: { article: IArticle }) {
  const t = useTranslations();
  const setting = useSiteSetting();
  const { locale } = useSiteCatalog();
  const passwdRef = useRef<string | null>(null);
  const [shouldCheckPassWord, setShouldCheckPassword] = useState(Boolean(article.needPassword));
  const tocs = parseArticleToc(article.toc ?? '');
  const keywords = [article.title]
    .concat((article.tags ?? []).map((tag) => (typeof tag === 'string' ? tag : tag?.label)))
    .concat(setting.seoKeyword?.split(','))
    .filter(Boolean)
    .join(',');

  const checkPassWord = useCallback(() => {
    ArticleProvider.checkPassword(article.id, passwdRef.current).then((res) => {
      if (res.pass) {
        Object.assign(article, res);
        setShouldCheckPassword(false);
      } else {
        message.error(t('wrongPasswd'));
        setShouldCheckPassword(true);
      }
    });
  }, [t, article]);

  const back = useCallback(() => {
    Router.push('/');
  }, []);

  useEffect(() => {
    setShouldCheckPassword(Boolean(article.needPassword));
  }, [article]);

  useEffect(() => {
    if (!shouldCheckPassWord) {
      ArticleProvider.updateArticleViews(article.id);
    }
  }, [shouldCheckPassWord, article.id]);

  const tagLabel = (tag: string | { id?: string; label?: string; value?: string }) =>
    typeof tag === 'string' ? tag : tag?.label ?? '';

  const tagValue = (tag: string | { id?: string; label?: string; value?: string }) =>
    typeof tag === 'string' ? tag : tag?.value ?? tag?.label ?? '';

  const tagKey = (tag: string | { id?: string; label?: string; value?: string }, index: number) =>
    typeof tag === 'string' ? tag : tag?.id ?? tag?.value ?? String(index);

  const Content = (
    <>
      <ContentStylesLoader />
      <Modal
        title={t('protectedArticleMsg')}
        cancelText={t('backHome')}
        okText={t('confirm')}
        open={shouldCheckPassWord}
        onOk={checkPassWord}
        onCancel={back}
        rootClassName={style.protectedArticleModal}
      >
        <Form.Item label={t('passwd')}>
          <Input.Password
            onChange={(e) => {
              passwdRef.current = e.target.value;
            }}
          />
        </Form.Item>
      </Modal>

      <Head>
        <title>{(article.title || t('unknownTitle')) + ' - ' + setting.systemTitle}</title>
        <meta name="description" content={article.summary || setting?.seoDesc} />
        <meta name="keywords" content={keywords} />
      </Head>

      <ImageViewer containerSelector="#js-article-wrapper">
        <article id="js-article-wrapper" className={style.articleWrap}>
          {setting.systemUrl ? (
            <>
              <meta itemProp="url" content={url.resolve(setting.systemUrl, `/article/${article.id}`)} />
              <meta itemProp="headline" content={article.title} />
              {article.tags?.length ? (
                <meta itemProp="keywords" content={article.tags.map(tagLabel).join(' ')} />
              ) : null}
              <meta itemProp="dataPublished" content={article.publishAt} />
              {article.cover ? <meta itemProp="image" content={resolveImageUrl(article.cover, 'large')} /> : null}
            </>
          ) : null}

          {article.cover ? (
            <div className={style.coverWrapper}>
              <Image url={article.cover} size="large" alt={t('articleCover') as string} />
            </div>
          ) : null}

          <div className={style.metaInfoWrap}>
            <h1 className={style.title}>{article.title}</h1>
            <p className={style.desc}>
              <span>
                {t('publishAt')}
                <LocaleTime date={article.publishAt} locale={locale} />
              </span>
              <span> • </span>
              <span>
                {t('readings')} {article.views}
              </span>
            </p>
          </div>

          <HtmlContent
            content={article.html}
            className="markdown"
            copyLabel={t('copy') as string}
            onCopy={() => message.success(t('copySuccess'))}
          />

          <div className={style.footerInfoWrap}>
            <div className={style.copyrightInfo}>
              {t('publishAt')}
              <LocaleTime date={article.publishAt} locale={locale} /> | {t('copyrightInfo')}：
              <a
                href="https://creativecommons.org/licenses/by-nc/3.0/cn/deed.zh"
                target="_blank"
                rel="noreferrer"
              >
                {t('copyrightContent')}
              </a>
            </div>

            {article.tags && article.tags.length ? (
              <div className={style.tagsWrap}>
                {article.tags.map((tag, index) => (
                  <div className={style.tagWrapper} key={tagKey(tag, index)}>
                    <div className={style.tag}>
                      <Link href={`/tag/${tagValue(tag)}`} scroll={false}>
                        <a>
                          <TagOutlined />
                          <span>{tagLabel(tag)}</span>
                        </a>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </article>

        {article.isCommentable ? (
          <div className={style.commentWrap}>
            <p className={style.title}>{t('comment')}</p>
            <Comment key={article.id} hostId={article.id} />
          </div>
        ) : null}

        <div className={style.recmmendArticles}>
          <p className={style.title}>{t('recommendToReading')}</p>
          <div className={style.articleContainer}>
            <ArticleRecommend articleId={article.id} needTitle={false} />
          </div>
        </div>
      </ImageViewer>
    </>
  );

  const Aside =
    tocs.length > 0 ? (
      <div className="sticky">
        <Toc key={article.id} tocs={tocs} maxHeight="80vh" />
      </div>
    ) : null;

  return (
    <DoubleColumnLayout
      leftNode={Content}
      rightNode={Aside}
      likesProps={{
        defaultCount: article.likes,
        id: article.id,
        api: (id, type) => ArticleProvider.updateArticleLikes(id, type).then((res) => res.likes),
      }}
      showComment={article.isCommentable}
    />
  );
}

const ArticlePage: NextPage<ArticlePageProps> = ({ article }) => {
  const router = useRouter();

  if (router.isFallback || !article?.id) {
    return <ArticleLoading />;
  }

  return <ArticleView article={article} />;
};

export const getStaticPaths = () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps = async (ctx) => {
  const id = ctx.params?.id;
  if (typeof id !== 'string' || !id) return themeNotFound();

  try {
    const data = await withApiRetry(() => fetchArticleDetailProps(themeApi, id));
    if (!data.article) return themeNotFound();
    return themeStaticProps({ article: data.article });
  } catch (error) {
    console.error('[reactpress] fetch article page', error);
    return themeNotFound();
  }
};

export default ArticlePage;
