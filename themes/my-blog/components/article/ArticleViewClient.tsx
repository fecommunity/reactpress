'use client';

import ArticleCopyrightBar from '@/components/article/ArticleCopyrightBar';
import ArticleReadingProgress from '@/components/article/ArticleReadingProgress';
import ArticleRecommend from '@/components/article/ArticleRecommend';
import ArticleTocPanel from '@/components/article/ArticleTocPanel';
import SectionHeading from '@/components/shared/SectionHeading';
import CommentSection from '@/components/comment/CommentSection';
import DoubleColumnLayout from '@/components/layout/DoubleColumnLayout';
import ReadingContent from '@/components/article/ReadingContent';
import Link from '@/components/shared/Link';
import { ArticleProvider } from '@/lib/providers/client';
import { estimateReadMinutes } from '@/lib/utils/reading';
import { getColorFromNumber } from '@/lib/utils/colors';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import {
  Image,
  ImageViewer,
  LocaleTime,
  parseArticleToc,
} from '@fecommunity/reactpress-toolkit/ui/content';
import { resolveImageUrl, useSiteCatalog, useSiteSetting } from '@fecommunity/reactpress-toolkit/theme';
import type { IArticle } from '@fecommunity/reactpress-toolkit/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ArticleViewClientProps {
  article: IArticle;
}

function tagLabel(tag: string | { label?: string }) {
  return typeof tag === 'string' ? tag : tag?.label ?? '';
}

function tagValue(tag: string | { value?: string; label?: string }) {
  return typeof tag === 'string' ? tag : tag?.value ?? tag?.label ?? '';
}

export default function ArticleViewClient({ article: initialArticle }: ArticleViewClientProps) {
  const { t } = useLocale();
  const setting = useSiteSetting();
  const { locale } = useSiteCatalog();
  const [article, setArticle] = useState(initialArticle);
  const [needPassword, setNeedPassword] = useState(Boolean(initialArticle.needPassword));
  const passwdRef = useRef('');
  const tocs = parseArticleToc(article.toc ?? '');
  const readMinutes = useMemo(() => estimateReadMinutes(article.html ?? ''), [article.html]);
  const readTimeLabel =
    locale === 'zh' ? `${readMinutes} 分钟阅读` : `${readMinutes} min read`;

  const likesApi = useCallback(
    (id: string, type: 'like' | 'dislike') =>
      ArticleProvider.updateArticleLikes(id, type).then((res) => res.likes),
    [],
  );

  useEffect(() => {
    setArticle(initialArticle);
    setNeedPassword(Boolean(initialArticle.needPassword));
  }, [initialArticle]);

  useEffect(() => {
    if (!needPassword) {
      ArticleProvider.updateArticleViews(article.id);
    }
  }, [needPassword, article.id]);

  const checkPassword = useCallback(() => {
    ArticleProvider.checkPassword(article.id, passwdRef.current).then((res) => {
      if (res.pass) {
        setArticle((prev) => ({ ...prev, ...res }));
        setNeedPassword(false);
      }
    });
  }, [article.id]);

  if (needPassword) {
    return (
      <div className="mx-auto max-w-lg rounded-lg bg-[var(--bg-box)] p-6 shadow-[var(--box-shadow)]">
        <h2 className="mt-0 text-lg font-semibold">{t('protectedArticleMsg')}</h2>
        <input
          type="password"
          onChange={(e) => {
            passwdRef.current = e.target.value;
          }}
          className="mt-4 w-full rounded-md border border-[var(--border-color)] px-3 py-2"
          placeholder={t('passwd')}
        />
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={checkPassword}
            className="rounded-md bg-[var(--primary-color)] px-4 py-2 text-white"
          >
            {t('confirm')}
          </button>
          <Link href="/" className="rounded-md border border-[var(--border-color)] px-4 py-2 no-underline">
            {t('backHome')}
          </Link>
        </div>
      </div>
    );
  }

  const content = (
    <ImageViewer containerSelector="#js-article-wrapper">
      <div className="rp-article-page">
      <article id="js-article-wrapper" className="rp-article-wrap">
        {setting.systemUrl ? (
          <>
            <meta itemProp="url" content={new URL(`/article/${article.id}`, setting.systemUrl).href} />
            <meta itemProp="headline" content={article.title} />
            {article.tags?.length ? (
              <meta itemProp="keywords" content={article.tags.map(tagLabel).join(' ')} />
            ) : null}
            <meta itemProp="datePublished" content={article.publishAt} />
            {article.cover ? (
              <meta itemProp="image" content={resolveImageUrl(article.cover, 'large')} />
            ) : null}
          </>
        ) : null}

        {article.cover ? (
          <div className="rp-article-cover-hero rp-cover-zoom-host">
            <Image
              url={article.cover}
              size="large"
              alt={t('articleCover')}
              className="rp-cover-zoom h-full w-full object-cover"
            />
          </div>
        ) : null}

        <div className="rp-article-inner">
          <header className="rp-article-header">
            <div className="rp-article-meta-row">
              <time className="rp-article-meta-chip">
                <LocaleTime date={article.publishAt} locale={locale} />
              </time>
              <span className="rp-article-meta-dot" aria-hidden />
              <span className="rp-article-meta-chip">{readTimeLabel}</span>
              <span className="rp-article-meta-dot" aria-hidden />
              <span className="rp-article-meta-chip">
                {article.views} {t('readings')}
              </span>
            </div>
            <h1 className="rp-article-title">{article.title}</h1>
            {article.tags?.length ? (
              <div className="rp-article-tags rp-article-tags--header">
                {article.tags.map((tag, index) => (
                  <Link
                    key={tagValue(tag) || index}
                    href={`/tag/${tagValue(tag)}`}
                    className="rp-article-tag rp-article-tag--hash"
                    style={{ color: getColorFromNumber(index) }}
                  >
                    #{tagLabel(tag)}
                  </Link>
                ))}
              </div>
            ) : null}
          </header>

          <div className="rp-article-body">
            <ReadingContent content={article.html} />
          </div>

          <footer className="rp-article-footer">
            <ArticleCopyrightBar publishAt={article.publishAt} />
          </footer>
        </div>
      </article>

      {article.isCommentable ? (
        <section id="rp-comment-section" className="rp-comment-wrap">
          <SectionHeading>{t('comment')}</SectionHeading>
          <div className="rp-comment-panel">
            <CommentSection hostId={article.id} />
          </div>
        </section>
      ) : null}

      <ArticleRecommend
        articleId={article.id}
        needTitle={false}
        mode="vertical"
        asPageSection
        hideWhenEmpty
      />
      </div>
    </ImageViewer>
  );

  return (
    <>
      <ArticleReadingProgress />
      <DoubleColumnLayout
      leftNode={content}
      rightNode={tocs.length ? <ArticleTocPanel tocs={tocs} /> : null}
      sidebarCollapsible={tocs.length > 0}
      likesProps={{
        defaultCount: article.likes,
        id: article.id,
        api: likesApi,
      }}
      bookmarkId={article.id}
      showComment={Boolean(article.isCommentable)}
      showShare
      coverPreloadUrl={article.cover ? resolveImageUrl(article.cover, 'large') : undefined}
    />
    </>
  );
}
