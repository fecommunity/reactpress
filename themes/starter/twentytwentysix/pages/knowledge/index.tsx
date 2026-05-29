import { GetStaticProps } from 'next';
import Link from 'next/link';
import DoubleColumnLayout from '../../components/DoubleColumnLayout';
import HomeSidebar from '../../components/HomeSidebar';
import SystemNotice from '../../components/SystemNotice';
import ThemeShell from '../../components/ThemeShell';
import { useThemeT } from '../../hooks/useThemeT';
import { fetchKnowledgeList, themeApi, withThemeStaticProps } from '../../lib/fetch';

interface KnowledgeProps {
  books: Array<{
    id: string;
    title: string;
    summary?: string;
    cover?: string;
    views?: number;
  }>;
}

export default function KnowledgeIndex({ books = [] }: KnowledgeProps) {
  const t = useThemeT();
  const summary = t('knowledge.summary', '共 {count} 本').replace('{count}', String(books.length));

  return (
    <ThemeShell head={<title>{t('knowledge.title', '专辑')}</title>}>
      <DoubleColumnLayout
        top={<SystemNotice />}
        main={
          <>
            <h1 className="archives-page-title">{t('knowledge.title', '专辑')}</h1>
            <p className="archives-summary">{summary}</p>
            <ul className="knowledge-list">
              {books.map((book) => (
                <li key={book.id} className="knowledge-item">
                  <Link href={`/knowledge/${book.id}`}>
                    {book.cover ? <img src={book.cover} alt="" className="knowledge-cover" /> : null}
                    <div>
                      <h2>{book.title}</h2>
                      {book.summary ? <p>{book.summary}</p> : null}
                      {book.views != null ? (
                        <span className="meta">
                          {book.views} {t('common.viewsShort', '阅读')}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            {!books.length ? (
              <p className="empty-state">{t('empty.noBooks', '暂无专辑内容。')}</p>
            ) : null}
          </>
        }
        sidebar={<HomeSidebar />}
      />
    </ThemeShell>
  );
}

export const getStaticProps: GetStaticProps<KnowledgeProps> = async () =>
  withThemeStaticProps(
    'fetch knowledge list failed',
    () => fetchKnowledgeList(themeApi),
    { books: [] },
  );
