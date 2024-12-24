import { RightOutlined, TagOutlined } from '@ant-design/icons';
import { Alert, Breadcrumb, Button } from 'antd';
import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Link from 'next/link';
import { useContext, useMemo } from 'react';

import { ArticleRecommend } from '@/components/ArticleRecommend';
import { GlobalContext } from '@/context/global';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';

import AboutUs from '@/components/AboutUs';
import { Tags } from '@/components/Tags';
import style from './index.module.scss';
const url = require('url');

interface IProps {
  siteKey: string;
}

const Article: NextPage<IProps> = ({ siteKey }) => {
  const t = useTranslations();
  const { setting, tags, globalSetting } = useContext(GlobalContext);

  const article = useMemo(() => {
    const urlItem = globalSetting?.globalConfig?.urlConfig
      .map((item) => item.children)
      .flat()
      .find((item) => item.key === siteKey);
    return {
      id: siteKey.toString(),
      title: `${urlItem?.label}`,
      cover: urlItem?.icon || `${urlItem.url}/favicon.ico`,
      summary: urlItem?.description,
      url: urlItem?.url,
      publishAt: Date.now().toLocaleString(),
      tags: [
        {
          label: '网址导航',
          value: '',
        },
        {
          label: urlItem?.label,
          value: `${siteKey}`,
        },
      ],
    };
  }, [siteKey]);

  const Content = (
    <>
      <Head>
        <title>{`${article?.title || t('unknownTitle')} - ${t('nav')} - ${setting.systemTitle}`}</title>
      </Head>
      <div>
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

          {/* S 文章元信息 */}
          <div className={style.metaInfoWrap}>
            <h1 className={style.title}>{article.title}</h1>
          </div>
          {/* E 文章元信息 */}

          <p className={style.articleContent}>
            {article.cover && <img src={article.cover} alt={t('articleCover') as string} />}
            <span>{article.summary}</span>
            <iframe width="100%" height="100%" src={article.url} allowFullScreen />
          </p>
          <Alert
            style={{ marginTop: 8 }}
            message="本站只做内容预览，不做任何信息存储，请注意您的账号和财产安全。如遇内容无法预览，请点击“打开网站”按钮预览。"
            type="warning"
          />

          <Button
            type="primary"
            icon={<RightOutlined />}
            iconPosition="end"
            style={{ marginTop: 8 }}
            onClick={() => {
              window.open(article.url, '_blank');
            }}
          >
            打开网站
          </Button>
          {/* E 文章内容 */}

          {/* S 文章脚部 */}
          <div className={style.footerInfoWrap}>
            {/* S 文章标签 */}
            {article.tags && article.tags.length ? (
              <div className={style.tagsWrap}>
                {article.tags.map((tag) => {
                  return (
                    <div className={style.tagWrapper} key={tag.value}>
                      <div className={style.tag}>
                        <Link href={`/nav/${tag.value}`} scroll={false}>
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
        {/* S 推荐文章 */}
        <div className={style.recmmendArticles}>
          <p className={style.title}>{t('recommendToReading')}</p>
          <div className={style.articleContainer}>
            <ArticleRecommend articleId={article.id} needTitle={false} />
          </div>
        </div>
        {/* E 推荐文章 */}
      </div>
    </>
  );

  return (
    <DoubleColumnLayout
      leftNode={Content}
      topNode={
        <div className={style.breadcrump}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/nav">
                <a aria-label="nav">{'导航'}</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{article.title}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      }
      rightNode={
        <div className={'sticky'}>
          <Tags tags={tags} animationMode />
          <AboutUs setting={setting} />
        </div>
      }
      showComment={false}
    />
  );
};

Article.getInitialProps = async (ctx) => {
  const { id } = ctx.query;
  const [siteKey] = typeof id === 'string' ? id.split('.') : id;
  return { siteKey };
};

export default Article;
