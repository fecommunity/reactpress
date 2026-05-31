import { TagOutlined } from '@ant-design/icons';
import {
  HtmlContent,
  ImageViewer,
  LocaleTime,
  parseArticleToc,
} from '@fecommunity/reactpress-toolkit/ui/content';
import { Image } from '@fecommunity/reactpress-toolkit/ui/content';
import { SiteCatalogContext as GlobalContext, resolveImageUrl } from '@fecommunity/reactpress-toolkit/theme';
import { Form, Input, message, Modal } from 'antd';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { default as Router } from 'next/router';
import { useTranslations } from 'next-intl';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { ArticleRecommend } from '@/components/ArticleRecommend';
import { Comment } from '@/components/Comment';
import { Toc } from '@/components/Toc';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import { ArticleProvider } from '@/providers';

import style from './index.module.scss';
const url = require('url');

interface IProps {
  article: IArticle;
}

const Article: NextPage<IProps> = ({ article }) => {
  const t = useTranslations();
  const { setting, locale } = useContext(GlobalContext);
  const passwdRef = useRef<string | null>(null);
  const [shouldCheckPassWord, setShouldCheckPassword] = useState(article && article.needPassword);
  const tocs = parseArticleToc(article?.toc);
  const keywords = [article.title]
    .concat((article?.tags ?? []).map((tag) => (typeof tag === 'string' ? tag : tag?.label)))
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
    setShouldCheckPassword(article && article.needPassword);
  }, [article]);

  useEffect(() => {
    if (!shouldCheckPassWord) {
      ArticleProvider.updateArticleViews(article.id);
    }
  }, [shouldCheckPassWord, article]);

  const Content = (
    <>
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
        <title>{(article?.title || t('unknownTitle')) + ' - ' + setting.systemTitle}</title>
        <meta name="description" content={article?.summary || setting?.seoDesc} />
        <meta name="keywords" content={keywords} />
      </Head>

      <ImageViewer containerSelector="#js-article-wrapper">
        <article id="js-article-wrapper" className={style.articleWrap}>
          {setting.systemUrl ? (
            <>
              <meta itemProp="url" content={url.resolve(setting.systemUrl, `/article/${article.id}`)} />
              <meta itemProp="headline" content={article.title} />
              {article.tags ? (
                <meta itemProp="keywords" content={article.tags.map((tag) => tag.label).join(' ')} />
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
                {article.tags.map((tag) => (
                  <div className={style.tagWrapper} key={tag.id}>
                    <div className={style.tag}>
                      <Link href={'/tag/[tag]'} as={'/tag/' + tag.value} scroll={false}>
                        <a aria-label={tag.label}>
                          <TagOutlined />
                          <span>{tag.label}</span>
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
};

Article.getInitialProps = async (ctx) => {
  const { id } = ctx.query;
  const article = await ArticleProvider.getArticle(id);
  return { article };
};

export default Article;
