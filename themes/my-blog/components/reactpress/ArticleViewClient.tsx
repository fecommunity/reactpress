'use client';

import ArticleRecommend from '@/components/reactpress/ArticleRecommend';
import ArticleTocPanel from '@/components/reactpress/ArticleTocPanel';
import CommentSection from '@/components/reactpress/CommentSection';
import DoubleColumnLayout from '@/components/reactpress/DoubleColumnLayout';
import ReadingContent from '@/components/reactpress/ReadingContent';
import Link from '@/components/Link';
import { ArticleProvider } from '@/src/providers';
import { TagIcon } from '@/src/utils/icons';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import {
  Image,
  ImageViewer,
  LocaleTime,
  parseArticleToc,
} from '@fecommunity/reactpress-toolkit/ui/content';
import { resolveImageUrl, useSiteCatalog, useSiteSetting } from '@fecommunity/reactpress-toolkit/theme';
import type { IArticle } from '@fecommunity/reactpress-toolkit/types';
import { useCallback, useEffect, useRef, useState } from 'react';

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
      <article id="js-article-wrapper" className="rp-article-wrap overflow-hidden rounded-lg bg-[var(--bg-box)] p-4 shadow-[var(--box-shadow)] md:p-4">
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
          <div className="rp-article-cover w-full">
            <Image
              url={article.cover}
              size="large"
              alt={t('articleCover')}
              className="inline-block h-auto max-h-[480px] w-full rounded-lg object-cover"
            />
          </div>
        ) : null}

        <div className="rp-article-meta text-center">
          <h1 className="rp-article-title m-0 mt-3 text-[1.75rem] leading-snug font-bold md:text-[2.5rem]">
            {article.title}
          </h1>
          <p className="rp-article-desc mt-3 mb-5 text-sm italic text-[var(--main-text-color)]">
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

        <ReadingContent content={article.html} />

        <div className="rp-article-footer mt-8 border-t border-dashed border-[var(--border-color)] pt-5 text-[var(--second-text-color)]">
          <div className="rp-article-copyright mb-5 text-center text-xs leading-relaxed">
            {t('publishAt')}
            <LocaleTime date={article.publishAt} locale={locale} /> | {t('copyrightInfo')}：
            <a
              href="https://creativecommons.org/licenses/by-nc/3.0/cn/deed.zh"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--primary-color)]"
            >
              {t('copyrightContent')}
            </a>
          </div>

          {article.tags?.length ? (
            <div className="rp-article-tags -mx-2 text-center text-xs">
              {article.tags.map((tag, index) => (
                <span key={tagValue(tag) || index} className="inline-block px-2">
                  <Link
                    href={`/tag/${tagValue(tag)}`}
                    className="rp-article-tag inline-flex items-center border border-[var(--border-color)] bg-[var(--bg-second)] px-2 py-1 text-sm text-[var(--second-text-color)] no-underline hover:border-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white"
                  >
                    <TagIcon size={14} />
                    <span className="ml-2">{tagLabel(tag)}</span>
                  </Link>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </article>

      {article.isCommentable ? (
        <div className="rp-comment-wrap mt-4">
          <p className="rp-cms-section-title">{t('comment')}</p>
          <div className="rp-comment-panel">
            <CommentSection hostId={article.id} />
          </div>
        </div>
      ) : null}

      <div className="rp-article-recommend mt-4">
        <p className="rp-cms-section-title">{t('recommendToReading')}</p>
        <div className="overflow-hidden rounded-lg shadow-[var(--box-shadow)] [&_.rp-article-list]:shadow-none">
          <ArticleRecommend articleId={article.id} needTitle={false} mode="vertical" />
        </div>
      </div>
    </ImageViewer>
  );

  return (
    <DoubleColumnLayout
      leftNode={content}
      rightNode={tocs.length ? <ArticleTocPanel tocs={tocs} /> : null}
      likesProps={{
        defaultCount: article.likes,
        id: article.id,
        api: (id, type) => ArticleProvider.updateArticleLikes(id, type).then((res) => res.likes),
      }}
      showComment={Boolean(article.isCommentable)}
      coverPreloadUrl={article.cover ? resolveImageUrl(article.cover, 'large') : undefined}
    />
  );
}
