import DoubleColumnLayout from '@/components/DoubleColumnLayout';
import PageHead from '@/components/PageHead';
import Sidebar from '@/components/Sidebar';
import {
  articlePath,
  fetchArchives,
  formatPublishDateShort,
  PageHeader,
  themeApi,
  useSiteCatalog,
} from '@fecommunity/reactpress-toolkit/theme';
import { NextPage } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

type ArchiveTree = Record<string, Record<string, Array<{ id: string; title: string; publishAt?: string }>>>;

interface ArchivesProps {
  archives: ArchiveTree;
}

function countArticles(archives: ArchiveTree): number {
  return Object.values(archives).reduce((yearTotal, months) => {
    return (
      yearTotal +
      Object.values(months).reduce((monthTotal, list) => monthTotal + list.length, 0)
    );
  }, 0);
}

const ArchivesPage: NextPage<ArchivesProps> = ({ archives = {} }) => {
  const t = useTranslations();
  const { categories, tags } = useSiteCatalog();
  const years = Object.keys(archives).sort((a, b) => Number(b) - Number(a));
  const total = countArticles(archives);

  return (
    <>
      <PageHead title={t('archives') || 'Archives'} />
      <DoubleColumnLayout
        top={
          <PageHeader
            title={t('archives') || 'Archives'}
            titleClassName="text-2xl font-bold tracking-tight"
            description={`${total} ${t('articles') || 'articles'}`}
            descriptionClassName="text-muted-foreground"
          />
        }
        main={
          years.length ? (
            <div className="space-y-10">
              {years.map((year) => {
                const months = Object.keys(archives[year]).sort((a, b) => Number(b) - Number(a));
                return (
                  <section key={year}>
                    <h2 className="mb-4 text-xl font-semibold">{year}</h2>
                    <div className="space-y-6">
                      {months.map((month) => {
                        const items = archives[year][month] ?? [];
                        return (
                          <div key={month}>
                            <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                              {month}
                            </h3>
                            <ul className="space-y-2">
                              {items.map((article) => (
                                <li key={article.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                  {article.publishAt ? (
                                    <time
                                      dateTime={article.publishAt}
                                      className="text-xs tabular-nums text-muted-foreground"
                                    >
                                      {formatPublishDateShort(article.publishAt)}
                                    </time>
                                  ) : null}
                                  <Link href={articlePath(article.id)}>
                                    <a className="text-sm font-medium no-underline hover:text-primary">
                                      {article.title}
                                    </a>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('noArticles') || 'No posts yet.'}</p>
          )
        }
        sidebar={<Sidebar categories={categories} tags={tags} />}
      />
    </>
  );
};

ArchivesPage.getInitialProps = async () => {
  try {
    const response = await fetchArchives(themeApi);
    const archives = (response as { data?: ArchiveTree })?.data ?? response ?? {};
    return { archives, needLayoutFooter: true };
  } catch {
    return { archives: {}, needLayoutFooter: true };
  }
};

export default ArchivesPage;
