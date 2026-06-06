'use client';

import DoubleColumnLayout from '@/components/reactpress/DoubleColumnLayout';
import KnowledgeList from '@/components/reactpress/KnowledgeList';
import Link from '@/components/Link';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { Image, LocaleTime } from '@fecommunity/reactpress-toolkit/ui/content';
import type { IKnowledge } from '@fecommunity/reactpress-toolkit/types';
import { useCallback, useMemo } from 'react';

type KnowledgeBook = IKnowledge & { children?: IKnowledge[] };

interface KnowledgeBookClientProps {
  pId: string;
  book: KnowledgeBook;
  otherBooks: KnowledgeBook[];
}

export default function KnowledgeBookClient({ pId, book, otherBooks = [] }: KnowledgeBookClientProps) {
  const { t } = useLocale();
  const chapters = useMemo(() => book.children ?? [], [book]);

  const startReading = useCallback(() => {
    const chapter = chapters[0];
    if (chapter) {
      window.location.href = `/knowledge/${pId}/${chapter.id}`;
    }
  }, [chapters, pId]);

  return (
    <DoubleColumnLayout
      topNode={
        <nav className="mb-4 text-sm text-[var(--second-text-color)]">
          <Link href="/knowledge" className="text-[var(--primary-color)] no-underline hover:underline">
            {t('knowledgeBooks')}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--main-text-color)]">{book.title}</span>
        </nav>
      }
      leftNode={
        <div className="overflow-hidden rounded-lg bg-[var(--bg-box)] shadow-[var(--box-shadow)]">
          <header className="border-b border-[var(--border-color)] px-4 py-4 text-lg font-semibold text-[var(--main-text-color)]">
            {book.title}
          </header>
          <main className="p-4">
            <section className="flex flex-col gap-4 sm:flex-row">
              {book.cover ? (
                <div className="h-40 w-full shrink-0 overflow-hidden rounded-lg sm:w-48">
                  <Image url={book.cover} size="medium" alt="cover" />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <h1 className="m-0 text-xl font-semibold text-[var(--main-text-color)]">{book.title}</h1>
                {book.summary ? (
                  <p className="mt-2 text-sm leading-relaxed text-[var(--second-text-color)]">{book.summary}</p>
                ) : null}
                <p className="mt-3 text-xs text-[var(--second-text-color)]">
                  <span>
                    {book.views} {t('readingCount')}
                  </span>
                  <span className="mx-2">·</span>
                  <LocaleTime date={book.publishAt} />
                </p>
                <button
                  type="button"
                  onClick={startReading}
                  disabled={!chapters.length}
                  className="mt-4 rounded-lg bg-[var(--primary-color)] px-5 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('startReading')}
                </button>
              </div>
            </section>

            {chapters.length ? (
              <ul className="m-0 mt-6 list-none border-t border-[var(--border-color)] p-0 pt-2">
                {chapters.map((chapter) => (
                  <li key={chapter.id} className="border-b border-[var(--border-color)] last:border-b-0">
                    <Link
                      href={`/knowledge/${pId}/${chapter.id}`}
                      className="flex items-center justify-between gap-3 px-2 py-3 text-sm no-underline hover:bg-[var(--bg-second)]"
                    >
                      <span className="min-w-0 truncate text-[var(--main-text-color)]">{chapter.title}</span>
                      <span className="flex shrink-0 items-center gap-2 text-xs text-[var(--second-text-color)]">
                        <LocaleTime date={chapter.createAt} />
                        <span aria-hidden>›</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-6 py-8 text-center text-sm text-[var(--second-text-color)]">{t('pleaseWait')}</div>
            )}
          </main>
        </div>
      }
      rightNode={
        <div className="rp-sidebar-sticky sticky mb-4 w-72 overflow-hidden rounded-lg bg-[var(--bg-box)] shadow-[var(--box-shadow)]">
          <header className="border-b border-[var(--border-color)] px-4 py-3 font-semibold text-[var(--main-text-color)]">
            {t('otherKnowledges')}
          </header>
          <KnowledgeList knowledges={otherBooks} small />
        </div>
      }
    />
  );
}
