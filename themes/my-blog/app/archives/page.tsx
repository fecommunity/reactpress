import Link from '@/components/Link';
import {
  countArchiveArticles,
  fetchArchivesPageProps,
  formatArchiveDay,
  sortedArchiveYears,
  themeApi,
  withApiRetry,
  type ArchiveTree,
} from '@fecommunity/reactpress-toolkit/theme/server';

export const revalidate = 60;

function ArchiveContent({ articles }: { articles: ArchiveTree }) {
  const years = sortedArchiveYears(articles);
  const total = countArchiveArticles(articles);

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          Archives
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          {total} article{total === 1 ? '' : 's'}
        </p>
      </div>
      {years.map((year) => (
        <section key={year} className="py-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">{year}</h2>
          {Object.keys(articles[year]).map((month) => (
            <div key={`${year}-${month}`} className="mb-6">
              <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
                {month}
              </h3>
              <ul className="space-y-2">
                {articles[year][month].map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/article/${article.id}`}
                      className="text-primary-500 hover:text-primary-600 flex gap-3 text-base"
                    >
                      <span className="shrink-0 text-gray-500 dark:text-gray-400">
                        {formatArchiveDay(article.publishAt)}
                      </span>
                      <span>{article.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
      {!years.length && <p className="py-8 text-gray-500">No archives yet.</p>}
    </div>
  );
}

export default async function ArchivesPage() {
  let articles: ArchiveTree = {};

  try {
    const data = await withApiRetry(() => fetchArchivesPageProps(themeApi));
    articles = data.articles;
  } catch (error) {
    console.error('[my-blog] archives fetch failed', error);
  }

  return <ArchiveContent articles={articles} />;
}
