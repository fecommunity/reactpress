import { GetStaticProps } from 'next';
import Link from 'next/link';
import { formatPublishDateShort } from '@fecommunity/reactpress-toolkit/theme';
import DoubleColumnLayout from '../../components/DoubleColumnLayout';
import HomeSidebar from '../../components/HomeSidebar';
import SystemNotice from '../../components/SystemNotice';
import ThemeShell from '../../components/ThemeShell';
import { useThemeT } from '../../hooks/useThemeT';
import {
  countArchiveArticles,
  fetchArticleArchives,
  themeApi,
  withThemeStaticProps,
} from '../../lib/fetch';

interface ArchivesProps {
  archives: Record<string, Record<string, Array<{ id: string; title: string; publishAt?: string }>>>;
}

export default function ArchivesPage({ archives }: ArchivesProps) {
  const t = useThemeT();
  const total = countArchiveArticles(archives);
  const years = Object.keys(archives).sort((a, b) => Number(b) - Number(a));
  const summary = t('archives.summary', '{count} articles in total').replace(
    '{count}',
    String(total),
  );

  return (
    <ThemeShell head={<title>{t('archives.title', 'Timeline')}</title>}>
      <DoubleColumnLayout
        top={<SystemNotice />}
        main={
          <>
            <h1 className="archives-page-title">{t('archives.title', 'Timeline')}</h1>
            <p className="archives-summary">{summary}</p>
            <div className="archives-list">
              {years.map((year) => (
                <section key={year} className="archives-year">
                  <h2>{year}</h2>
                  {Object.keys(archives[year]).map((month) => (
                    <div key={`${year}-${month}`} className="archives-month">
                      <h3>{month}</h3>
                      <ul>
                        {(archives[year][month] ?? []).map((article) => (
                          <li key={article.id}>
                            <Link href={`/article/${article.id}`}>
                              {article.publishAt ? (
                                <time dateTime={article.publishAt}>
                                  {formatPublishDateShort(article.publishAt)}
                                </time>
                              ) : null}
                              <span>{article.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>
              ))}
              {!years.length ? <p className="empty-state">{t('empty.noArticles', 'No articles yet')}</p> : null}
            </div>
          </>
        }
        sidebar={<HomeSidebar />}
      />
    </ThemeShell>
  );
}

export const getStaticProps: GetStaticProps<ArchivesProps> = async () =>
  withThemeStaticProps(
    'fetch archives failed',
    () => fetchArticleArchives(themeApi),
    { archives: {} },
  );
