import PageHead from '@/components/PageHead';
import {
  fetchKnowledgeDetail,
  themeApi,
} from '@fecommunity/reactpress-toolkit/theme';
import { NextPage } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface KnowledgeBook {
  id: string;
  title: string;
  summary?: string;
  children?: Array<{ id: string; title: string; order?: number }>;
}

interface BookDetailProps {
  book: KnowledgeBook | null;
}

const KnowledgeBookPage: NextPage<BookDetailProps> = ({ book }) => {
  const t = useTranslations();

  if (!book) {
    return (
      <>
        <PageHead title={t('notFound') || 'Not found'} />
        <div className="site-container py-12">
          <p>{t('unknownKnowledge') || 'Knowledge book not found.'}</p>
        </div>
      </>
    );
  }

  const chapters = [...(book.children ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  return (
    <>
      <PageHead title={book.title} description={book.summary || book.title} />
      <div className="site-container max-w-3xl py-8">
        <h1 className="text-3xl font-bold tracking-tight">{book.title}</h1>
        {book.summary ? <p className="mt-2 text-muted-foreground">{book.summary}</p> : null}

        {chapters.length ? (
          <ol className="mt-8 space-y-2 border-t border-border pt-6">
            {chapters.map((chapter, index) => (
              <li key={chapter.id}>
                <Link href={`/knowledge/${book.id}/${chapter.id}`}>
                  <a className="flex items-baseline gap-3 rounded-md px-2 py-2 no-underline hover:bg-accent">
                    <span className="text-sm tabular-nums text-muted-foreground">{index + 1}.</span>
                    <span className="font-medium">{chapter.title}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            {t('noKnowledgeChapters') || 'No chapters in this book yet.'}
          </p>
        )}

        <p className="mt-8">
          <Link href="/knowledge">
            <a className="text-sm no-underline">← {t('knowledge') || 'Knowledge'}</a>
          </Link>
        </p>
      </div>
    </>
  );
};

KnowledgeBookPage.getInitialProps = async ({ query }) => {
  const pId = typeof query?.pId === 'string' ? query.pId : '';
  if (!pId) return { book: null, needLayoutFooter: true };

  try {
    const response = await fetchKnowledgeDetail(themeApi, pId);
    const book = (response as { data?: KnowledgeBook })?.data ?? response;
    return { book, needLayoutFooter: true };
  } catch {
    return { book: null, needLayoutFooter: true };
  }
};

export default KnowledgeBookPage;
