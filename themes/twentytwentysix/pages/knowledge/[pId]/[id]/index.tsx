import PageHead from '@/components/PageHead';
import {
  fetchKnowledgeDetail,
  themeApi,
} from '@fecommunity/reactpress-toolkit/theme';
import { HtmlContent } from '@fecommunity/reactpress-toolkit/ui/content';
import { NextPage } from 'next';
import Link from 'next/link';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

interface KnowledgeChapter {
  id: string;
  title: string;
  html?: string;
  content?: string;
}

interface KnowledgeBook {
  id: string;
  title: string;
  children?: KnowledgeChapter[];
}

interface ChapterProps {
  pId: string;
  id: string;
  book: KnowledgeBook | null;
  chapter: KnowledgeChapter | null;
}

const KnowledgeChapterPage: NextPage<ChapterProps> = ({ pId, id, book, chapter }) => {
  const t = useTranslations();

  const { prev, next } = useMemo(() => {
    const chapters = book?.children ?? [];
    const idx = chapters.findIndex((item) => item.id === id);
    return {
      prev: idx > 0 ? chapters[idx - 1] : null,
      next: idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null,
    };
  }, [book, id]);

  if (!book || !chapter) {
    return (
      <>
        <PageHead title={t('notFound') || 'Not found'} />
        <div className="site-container py-12">
          <p>{t('unknownKnowledgeChapter') || 'Chapter not found.'}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead title={chapter.title} description={book.title} />
      <div className="site-container max-w-3xl py-8">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/knowledge">
            <a className="no-underline">{t('knowledge') || 'Knowledge'}</a>
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/knowledge/${pId}`}>
            <a className="no-underline">{book.title}</a>
          </Link>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight">{chapter.title}</h1>

        <div className="prose-content mt-6">
          {chapter.html ? (
            <HtmlContent html={chapter.html} />
          ) : chapter.content ? (
            <p>{chapter.content}</p>
          ) : null}
        </div>

        <nav className="mt-10 flex flex-wrap justify-between gap-4 border-t border-border pt-6 text-sm">
          {prev ? (
            <Link href={`/knowledge/${pId}/${prev.id}`}>
              <a className="no-underline">← {prev.title}</a>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/knowledge/${pId}/${next.id}`}>
              <a className="no-underline">{next.title} →</a>
            </Link>
          ) : null}
        </nav>
      </div>
    </>
  );
};

KnowledgeChapterPage.getInitialProps = async ({ query }) => {
  const pId = typeof query?.pId === 'string' ? query.pId : '';
  const id = typeof query?.id === 'string' ? query.id : '';
  if (!pId || !id) {
    return { pId, id, book: null, chapter: null, needLayoutFooter: true };
  }

  try {
    const response = await fetchKnowledgeDetail(themeApi, pId);
    const book = ((response as { data?: KnowledgeBook })?.data ?? response) as KnowledgeBook;
    const chapter = book?.children?.find((item) => item.id === id) ?? null;
    if (chapter && !chapter.html && !chapter.content) {
      const detail = await fetchKnowledgeDetail(themeApi, id);
      const full = (detail as { data?: KnowledgeChapter })?.data ?? detail;
      Object.assign(chapter, full);
    }
    return { pId, id, book, chapter, needLayoutFooter: true };
  } catch {
    return { pId, id, book: null, chapter: null, needLayoutFooter: true };
  }
};

export default KnowledgeChapterPage;
