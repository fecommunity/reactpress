import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NotFoundPanel, themeOnDemandPaths } from '@fecommunity/reactpress-toolkit/theme';
import DoubleColumnLayout from '../../../components/DoubleColumnLayout';
import HomeSidebar from '../../../components/HomeSidebar';
import SystemNotice from '../../../components/SystemNotice';
import ThemeShell from '../../../components/ThemeShell';
import { useThemeT } from '../../../hooks/useThemeT';
import { fetchKnowledgeBook, themeApi, withThemeStaticProps } from '../../../lib/fetch';

interface BookPageProps {
  book: {
    id: string;
    title: string;
    summary?: string;
    cover?: string;
    views?: number;
    children?: Array<{ id: string; title: string; publishAt?: string }>;
  } | null;
}

export default function KnowledgeBookPage({ book }: BookPageProps) {
  const router = useRouter();
  const t = useThemeT();

  if (router.isFallback) {
    return (
      <ThemeShell head={<title>{t('common.loading', '加载中…')}</title>}>
        <p className="loading-state">{t('common.loading', '加载中…')}</p>
      </ThemeShell>
    );
  }

  if (!book) {
    return (
      <ThemeShell head={<title>{t('article.notFound.title', '文章不存在')}</title>}>
        <NotFoundPanel
          title={t('knowledge.notFound.title', '专辑不存在')}
          description={t('knowledge.notFound.desc', '该专辑不存在或已下架。')}
        />
      </ThemeShell>
    );
  }

  const chapters = book.children ?? [];

  return (
    <ThemeShell head={<title>{book.title}</title>}>
      <DoubleColumnLayout
        top={<SystemNotice />}
        main={
          <div className="widget-card knowledge-book-card">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/knowledge">{t('nav.knowledge', '专辑')}</Link>
              <span aria-hidden="true"> / </span>
              <span>{book.title}</span>
            </nav>
            {book.cover ? (
              <img src={book.cover} alt="" className="knowledge-hero" />
            ) : null}
            <h1 className="knowledge-book-title">{book.title}</h1>
            {book.summary ? <p className="lead">{book.summary}</p> : null}
            {chapters.length ? (
              <>
                <Link
                  href={`/knowledge/${book.id}/${chapters[0].id}`}
                  className="btn-primary"
                >
                  {t('knowledge.startReading', '开始阅读')}
                </Link>
                <h2 className="section-title">{t('knowledge.chapters', '章节')}</h2>
                <ol className="chapter-list">
                  {chapters.map((chapter) => (
                    <li key={chapter.id}>
                      <Link href={`/knowledge/${book.id}/${chapter.id}`}>{chapter.title}</Link>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="empty-state">{t('empty.noBooks', '暂无专辑内容。')}</p>
            )}
          </div>
        }
        sidebar={<HomeSidebar />}
      />
    </ThemeShell>
  );
}

export const getStaticPaths: GetStaticPaths = async () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps<BookPageProps> = async ({ params }) => {
  const pId = params?.pId as string | undefined;
  return withThemeStaticProps(
    'fetch knowledge book failed',
    async () => fetchKnowledgeBook(themeApi, pId ?? ''),
    { book: null },
  );
};
