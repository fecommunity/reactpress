import { TagOutlined } from '@ant-design/icons';
import { Form, Input, message, Modal } from 'antd';
import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Link from 'next/link';
import { default as Router } from 'next/router';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { ArticleRecommend } from '@/components/ArticleRecommend';
import { Comment } from '@/components/Comment';
import { ImageViewer } from '@/components/ImageViewer';
import { LocaleTime } from '@/components/LocaleTime';
import { MarkdownReader } from '@/components/MarkdownReader';
import { Toc } from '@/components/Toc';
import { GlobalContext } from '@/context/global';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import { ArticleProvider } from '@/providers/article';

import style from './index.module.scss';
const url = require('url');

interface IProps {
  article: IArticle;
}

const Article: NextPage<IProps> = ({ article }) => {
  const t = useTranslations();
  const { setting } = useContext(GlobalContext);
  const passwdRef = useRef(null);
  const [shouldCheckPassWord, setShouldCheckPassword] = useState(article && article.needPassword);
  const tocs = article && article.toc ? JSON.parse(article.toc) : [];
  const keywords = [article.title]
    .concat(article?.tags.map((tag) => tag?.label))
    .concat(setting.seoKeyword?.split(','))
    .filter(Boolean)
    .join(',');

  // 检查文章密码
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

  const checkPassWordModal = (
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
  );

  useEffect(() => {
    setShouldCheckPassword(article && article.needPassword);
  }, [article]);

  // 更新阅读量
  useEffect(() => {
    if (!shouldCheckPassWord) {
      ArticleProvider.updateArticleViews(article.id);
    }
  }, [shouldCheckPassWord, article]);

  const Content = (
    <>
      {checkPassWordModal}
      <Head>
        <title>{(article?.title || t('unknownTitle')) + ' - ' + setting.systemTitle}</title>
        <meta name="description" content={article?.summary || setting?.seoDesc} />
        <meta name="keywords" content={keywords} />
      </Head>
      <ImageViewer containerSelector="#js-article-wrapper">
        <article id="js-article-wrapper" className={style.articleWrap}>
          {/* S 文章 Seo 信息 */}
          {setting.systemUrl && (
            <meta itemProp="url" content={url.resolve(setting.systemUrl, `/article/${article.id}`)} />
          )}
          <meta itemProp="headline" content={article.title} />
          {article.tags && <meta itemProp="keywords" content={article.tags.map((tag) => tag.label).join(' ')} />}
          <meta itemProp="dataPublished" content={article.publishAt} />
          {article.cover && <meta itemProp="image" content={article.cover} />}
          {/* E 文章 Seo 信息 */}

          {/* S 文章封面 */}
          {article.cover && (
            <div className={style.coverWrapper}>
              <img src={article.cover} alt={t('articleCover') as string} />
            </div>
          )}
          {/* E 文章封面 */}

          {/* S 文章元信息 */}
          <div className={style.metaInfoWrap}>
            <h1 className={style.title}>{article.title}</h1>
            <p className={style.desc}>
              <span>
                {t('publishAt')}
                <LocaleTime date={article.publishAt} />
              </span>
              <span> • </span>
              <span>
                {t('readings')} {article.views}
              </span>
            </p>
          </div>
          {/* E 文章元信息 */}

          {/* S 文章内容 */}
          <MarkdownReader content={article.html} />
          {/* E 文章内容 */}

          {/* S 文章脚部 */}
          <div className={style.footerInfoWrap}>
            {/* S 文章版权 */}
            <div className={style.copyrightInfo}>
              {t('publishAt')}
              <LocaleTime date={article.publishAt} /> | {t('copyrightInfo')}：
              <a href="https://creativecommons.org/licenses/by-nc/3.0/cn/deed.zh" target="_blank" rel="noreferrer">
                {t('copyrightContent')}
              </a>
            </div>
            {/* E 文章版权 */}

            {/* S 文章标签 */}
            {article.tags && article.tags.length ? (
              <div className={style.tagsWrap}>
                {article.tags.map((tag) => {
                  return (
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
                  );
                })}
              </div>
            ) : null}
            {/* E 文章标签 */}
          </div>
          {/* E 文章脚部 */}
        </article>

        {/* S 文章评论 */}
        {article.isCommentable && (
          <div className={style.commentWrap}>
            <p className={style.title}>{t('comment')}</p>
            <Comment key={article.id} hostId={article.id} />
          </div>
        )}
        {/* E 文章评论 */}

        {/* S 推荐文章 */}
        <div className={style.recmmendArticles}>
          <p className={style.title}>{t('recommendToReading')}</p>
          <div className={style.articleContainer}>
            <ArticleRecommend articleId={article.id} needTitle={false} />
          </div>
        </div>
        {/* E 推荐文章 */}
      </ImageViewer>
    </>
  );

  const Aside = (
    <>
      <div className={'sticky'}>
        {tocs && tocs.length ? <Toc key={article.id} tocs={tocs} maxHeight={'80vh'} /> : null}
      </div>
    </>
  );

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
