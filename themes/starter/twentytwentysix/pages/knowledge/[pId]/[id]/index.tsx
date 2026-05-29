import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  NotFoundPanel,
  themeOnDemandPaths,
  useReportArticleView,
  useRouteParam,
} from '@fecommunity/reactpress-toolkit/theme';
import ThemeShell from '../../../../components/ThemeShell';
import { fetchKnowledgeChapter, themeApi, withThemeStaticProps } from '../../../../lib/fetch';

interface ChapterProps {
  book: { id: string; title: string; children?: Array<{ id: string; title: string }> } | null;
  chapter: {
    id: string;
    title: string;
    html?: string;
    content?: string;
    views?: number;
  } | null;
}

export default function KnowledgeChapterPage({ book, chapter }: ChapterProps) {
  const router = useRouter();
  const chapterId = useRouteParam(chapter?.id, 'id');
  const views = useReportArticleView(
    !router.isFallback && chapter ? chapterId : undefined,
    chapter?.views,
  );

  if (router.isFallback) {
    return (
      <ThemeShell head={<title>Loading…</title>}>
        <p className="loading-state">Loading…</p>
      </ThemeShell>
    );
  }

  if (!book || !chapter) {
    return (
      <ThemeShell head={<title>Not Found</title>}>
        <NotFoundPanel title="Chapter not found" description="This chapter does not exist." />
      </ThemeShell>
    );
  }

  const chapters = book.children ?? [];
  const index = chapters.findIndex((c) => c.id === chapter.id);
  const prev = index > 0 ? chapters[index - 1] : null;
  const next = index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : null;
  const html = chapter.html || chapter.content;

  return (
    <ThemeShell head={<title>{chapter.title}</title>}>
      <article className="article-content-page knowledge-chapter">
        <nav className="breadcrumb">
          <Link href="/knowledge">Knowledge</Link>
          <span aria-hidden="true"> / </span>
          <Link href={`/knowledge/${book.id}`}>{book.title}</Link>
        </nav>
        <header className="article-header">
          <h1>{chapter.title}</h1>
          {views != null ? <p className="meta">{views} views</p> : null}
        </header>
        {html ? <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} /> : null}
        <nav className="chapter-nav">
          {prev ? (
            <Link href={`/knowledge/${book.id}/${prev.id}`} className="chapter-nav-prev">
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/knowledge/${book.id}/${next.id}`} className="chapter-nav-next">
              {next.title} →
            </Link>
          ) : null}
        </nav>
      </article>
    </ThemeShell>
  );
}

export const getStaticPaths: GetStaticPaths = async () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps<ChapterProps> = async ({ params }) => {
  const pId = params?.pId as string | undefined;
  const id = params?.id as string | undefined;
  return withThemeStaticProps(
    'fetch knowledge chapter failed',
    async () => fetchKnowledgeChapter(themeApi, pId ?? '', id ?? ''),
    { book: null, chapter: null },
  );
};
