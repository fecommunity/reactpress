import { LeftOutlined, RightOutlined } from '@/icons';
import { Breadcrumb } from '@/ui';
import cls from 'classnames';
import type { GetStaticProps } from 'next';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';

import { ContentStylesLoader } from '@/components/ContentStylesLoader';
import dynamic from 'next/dynamic';
import {
  ArticleToc,
  HtmlContent,
  ImageViewer,
  LocaleTime,
} from '@fecommunity/reactpress-toolkit/ui/content';
import {
  fetchKnowledgeChapterPageProps,
  themeApi,
  themeNotFound,
  themeOnDemandPaths,
  themeStaticProps,
  useSiteSetting,
  withApiRetry,
} from '@fecommunity/reactpress-toolkit/theme';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import { KnowledgeProvider } from '@/providers';

import style from './index.module.scss';

const Comment = dynamic(() => import('@/components/Comment').then((m) => m.Comment), { ssr: false });

interface IProps {
  pId: string;
  id: string;
  book: IKnowledge;
  chapter: IKnowledge;
}

export const getStaticPaths = () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps = async (ctx) => {
  const pId = ctx.params?.pId;
  const id = ctx.params?.id;
  if (typeof pId !== 'string' || !pId || typeof id !== 'string' || !id) return themeNotFound();

  try {
    const data = await withApiRetry(() => fetchKnowledgeChapterPageProps(themeApi, pId, id));
    if (!data.book || !data.chapter) return themeNotFound();
    return themeStaticProps(data);
  } catch (error) {
    console.error('[reactpress] fetch knowledge chapter page', error);
    return themeNotFound();
  }
};

const Page: NextPage<IProps> = ({ pId, id, book, chapter }) => {
  const t = useTranslations();
  const chapters = book.children || [];
  const tocs = chapter.toc ? JSON.parse(chapter.toc) : [];
  const idx = chapters.findIndex((t) => t.id === chapter.id);
  const setting = useSiteSetting();

  const prev = useMemo(() => {
    if (idx <= 0) {
      return null;
    }
    return chapters[idx - 1];
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = useMemo(() => {
    if (idx >= chapters.length - 1) {
      return null;
    }
    return chapters[idx + 1];
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  // 更新阅读量
  useEffect(() => {
    if (!chapter) {
      return;
    }
    KnowledgeProvider.updateKnowledgeViews(pId);
    KnowledgeProvider.updateKnowledgeViews(id);
  }, [pId, id, chapter]);

  useEffect(() => {
    if (!chapter) {
      return;
    }
    Promise.resolve().then(() => {
      const el = document.querySelector(`#js-toc-item-wrapper-` + id);
      console.log(el);
      el && el.scrollIntoView();
    });
  }, [chapter, id]);

  if (!chapter) {
    return <p>{t('unknownKnowledgeChapter')}</p>;
  }

  return (
    <>
      <ContentStylesLoader />
      <DoubleColumnLayout
        leftNode={
          <>
            <Head>
              <title>{`${book.title} - ${t('knowledge')} - ${setting.systemTitle}`}</title>
            </Head>
            <div className={cls(style.breadcrump)}>
              <Breadcrumb>
                <Breadcrumb.Item>
                  <Link href="/knowledge">
                    <a>{t('knowledgeBooks')}</a>
                  </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <Link as={`/knowledge/${pId}`} href="/knowledge/[pId]">
                    <a aria-label={book.title}>{book.title}</a>
                  </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{chapter.title}</Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <ImageViewer containerSelector="#js-knowledge-content">
              <div id="js-knowledge-content" className={style.content}>
                <article>
                  <div className={style.meta}>
                    <h1 className={style.title}>{chapter.title}</h1>
                    <p className={style.desc}>
                      <span>
                        {t('publishAt')}
                        <LocaleTime date={chapter.publishAt} />
                      </span>
                      <span> • </span>
                      <span>
                        {t('readings')} {chapter.views}
                      </span>
                    </p>
                  </div>
                  <div>
                    <HtmlContent content={chapter.html || chapter.content} />
                  </div>
                  <div className={style.copyrightInfo}>
                    {t('publishAt')}
                    <LocaleTime date={chapter.publishAt} /> | {t('copyrightInfo')}：
                    <a
                      href="https://creativecommons.org/licenses/by-nc/3.0/cn/deed.zh"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('copyrightContent')}
                    </a>
                  </div>
                  <div className={style.navigation}>
                    {prev && (
                      <div
                        className={style.left}
                        style={{
                          width: next ? '45%' : '100%',
                        }}
                      >
                        <Link href={`/knowledge/[pId]/[id]`} as={`/knowledge/${pId}/${prev.id}`}>
                          <a aria-label={prev.title}>
                            <LeftOutlined />
                            <span>{prev.title}</span>
                          </a>
                        </Link>
                      </div>
                    )}
                    {next && (
                      <div
                        className={style.right}
                        style={{
                          width: prev ? '45%' : '100%',
                        }}
                      >
                        <Link href={`/knowledge/[pId]/[id]`} as={`/knowledge/${pId}/${next.id}`}>
                          <a aria-label={next.title}>
                            <span>{next.title}</span>
                            <RightOutlined />
                          </a>
                        </Link>
                      </div>
                    )}
                  </div>
                </article>
                {book.isCommentable ? (
                  <div className={style.commentWrap}>
                    <p className={style.title}>{t('comment')}</p>
                    <Comment key={chapter.id} hostId={chapter.id} />
                  </div>
                ) : null}
              </div>
            </ImageViewer>
          </>
        }
        rightNode={
          <div className={'sticky'} style={{ marginTop: 37 }} data-margin-top={37}>
            <div className={cls(style.infoWrapper, style.isBg)}>
              <header>{book.title}</header>
              <main>
                <ul>
                  {chapters.map((chapter) => {
                    return (
                      <li key={chapter.id} id={`js-toc-item-wrapper-${chapter.id}`}>
                        <Link as={`/knowledge/${pId}/${chapter.id}`} href={`/knowledge/[pId]/[id]`}>
                          <a aria-label={chapter.title} className={cls(chapter.id === id && style.active)}>
                            {chapter.title}
                          </a>
                        </Link>
                        {chapter.id === id && tocs.length ? (
                          <ArticleToc items={tocs} showTitle={false} maxHeight="40vh" />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </main>
            </div>
          </div>
        }
        likesProps={{
          defaultCount: chapter.likes,
          id: chapter.id,
          api: (id, type) => KnowledgeProvider.updateKnowledgeLikes(id, type).then((res) => res.likes),
        }}
        showComment={book.isCommentable}
      />
    </>
  );
};

export default Page;
