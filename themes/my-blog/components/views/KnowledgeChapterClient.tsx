'use client';

import CommentSection from '@/components/comment/CommentSection';
import DoubleColumnLayout from '@/components/layout/DoubleColumnLayout';
import ArticleCopyrightBar from '@/components/article/ArticleCopyrightBar';
import ReadingContent from '@/components/article/ReadingContent';
import Link from '@/components/shared/Link';
import { KnowledgeProvider } from '@/lib/providers/client';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import {
  ArticleToc,
  ImageViewer,
  LocaleTime,
  parseArticleToc,
} from '@fecommunity/reactpress-toolkit/ui/content';
import type { IKnowledge } from '@fecommunity/reactpress-toolkit/types';
import { useEffect, useMemo } from 'react';

type KnowledgeNode = IKnowledge & { children?: IKnowledge[] };

interface KnowledgeChapterClientProps {
  pId: string;
  id: string;
  book: KnowledgeNode;
  chapter: KnowledgeNode;
}

export default function KnowledgeChapterClient({ pId, id, book, chapter }: KnowledgeChapterClientProps) {
  const { t } = useLocale();
  const chapters = book.children ?? [];
  const tocs = parseArticleToc(chapter.toc ?? '');
  const idx = chapters.findIndex((item) => item.id === chapter.id);

  const prev = useMemo(() => (idx > 0 ? chapters[idx - 1] : null), [chapters, idx]);
  const next = useMemo(() => (idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null), [chapters, idx]);

  useEffect(() => {
    KnowledgeProvider.updateKnowledgeViews(pId);
    KnowledgeProvider.updateKnowledgeViews(id);
  }, [pId, id]);

  useEffect(() => {
    const el = document.getElementById(`js-toc-item-wrapper-${id}`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [id]);

  return (
    <DoubleColumnLayout
      likesProps={{
        defaultCount: chapter.likes,
        id: chapter.id,
        api: (chapterId, type) => KnowledgeProvider.updateKnowledgeLikes(chapterId, type).then((res) => res.likes),
      }}
      showComment={book.isCommentable}
      leftNode={
        <>
          <nav className="mb-4 text-sm text-[var(--second-text-color)]">
            <Link href="/knowledge" className="text-[var(--primary-color)] no-underline hover:underline">
              {t('knowledgeBooks')}
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/knowledge/${pId}`} className="text-[var(--primary-color)] no-underline hover:underline">
              {book.title}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--main-text-color)]">{chapter.title}</span>
          </nav>
          <ImageViewer containerSelector="#js-knowledge-content">
            <div id="js-knowledge-content" className="overflow-hidden rounded-lg bg-[var(--bg-box)] p-4 shadow-[var(--box-shadow)] md:p-6">
              <article>
                <div className="mb-6 border-b border-[var(--border-color)] pb-4">
                  <h1 className="m-0 text-2xl font-semibold text-[var(--main-text-color)]">{chapter.title}</h1>
                  <p className="mt-2 text-sm text-[var(--second-text-color)]">
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
                <ReadingContent content={chapter.html || chapter.content} />
                <ArticleCopyrightBar publishAt={chapter.publishAt} />
                <div className="mt-6 flex flex-wrap gap-4">
                  {prev ? (
                    <Link
                      href={`/knowledge/${pId}/${prev.id}`}
                      className="flex min-w-0 items-center gap-2 rounded-lg border border-[var(--border-color)] px-4 py-3 text-sm no-underline hover:border-[var(--primary-color)]"
                      style={{ width: next ? '45%' : '100%' }}
                    >
                      <span aria-hidden>‹</span>
                      <span className="truncate text-[var(--main-text-color)]">{prev.title}</span>
                    </Link>
                  ) : null}
                  {next ? (
                    <Link
                      href={`/knowledge/${pId}/${next.id}`}
                      className="ml-auto flex min-w-0 items-center justify-end gap-2 rounded-lg border border-[var(--border-color)] px-4 py-3 text-sm no-underline hover:border-[var(--primary-color)]"
                      style={{ width: prev ? '45%' : '100%' }}
                    >
                      <span className="truncate text-[var(--main-text-color)]">{next.title}</span>
                      <span aria-hidden>›</span>
                    </Link>
                  ) : null}
                </div>
              </article>
              {book.isCommentable ? (
                <div className="rp-comment-wrap mt-8 border-t border-[var(--border-color)] pt-6">
                  <p className="rp-cms-section-title">{t('comment')}</p>
                  <div className="rp-comment-panel">
                    <CommentSection hostId={chapter.id} />
                  </div>
                </div>
              ) : null}
            </div>
          </ImageViewer>
        </>
      }
      rightNode={
        <div className="rp-sidebar-sticky sticky mb-4 w-72 overflow-hidden rounded-lg bg-[var(--bg-box)] shadow-[var(--box-shadow)]">
          <header className="border-b border-[var(--border-color)] px-4 py-3 font-semibold text-[var(--main-text-color)]">
            {book.title}
          </header>
          <ul className="m-0 max-h-[70vh] list-none overflow-y-auto p-0">
            {chapters.map((item) => (
              <li key={item.id} id={`js-toc-item-wrapper-${item.id}`} className="border-b border-[var(--border-color)] last:border-b-0">
                <Link
                  href={`/knowledge/${pId}/${item.id}`}
                  className={`block px-4 py-2.5 text-sm no-underline ${
                    item.id === id
                      ? 'bg-[var(--bg-second)] font-medium text-[var(--primary-color)]'
                      : 'text-[var(--main-text-color)] hover:bg-[var(--bg-second)]'
                  }`}
                >
                  {item.title}
                </Link>
                {item.id === id && tocs.length ? (
                  <div className="border-t border-[var(--border-color)] px-2 py-2">
                    <ArticleToc items={tocs} showTitle={false} maxHeight="40vh" />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      }
    />
  );
}
