import Link from '@/components/Link';
import ArticleCard from '@/components/ArticleCard';
import { fetchSearchPageProps, themeApi } from '@fecommunity/reactpress-toolkit/theme/server';

interface PageProps {
  searchParams: Promise<{ keyword?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { keyword = '' } = await searchParams;
  const trimmed = keyword.trim();

  let articles = [];
  try {
    const data = await fetchSearchPageProps(themeApi, trimmed);
    articles = data.articles;
  } catch (error) {
    console.error('[my-blog] search fetch failed', error);
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-4 pt-6 pb-8">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-gray-100">
          Search
        </h1>
        <form action="/search" method="get" className="relative max-w-xl">
          <input
            aria-label="Search articles"
            type="search"
            name="keyword"
            defaultValue={trimmed}
            placeholder="Search articles..."
            className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            type="submit"
            className="bg-primary-500 hover:bg-primary-600 absolute top-1 right-1 rounded px-3 py-1 text-sm text-white"
          >
            Search
          </button>
        </form>
        {trimmed ? (
          <p className="text-gray-500 dark:text-gray-400">
            {articles.length} result{articles.length === 1 ? '' : 's'} for &ldquo;{trimmed}&rdquo;
          </p>
        ) : null}
      </div>
      {trimmed ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!articles.length && <li className="py-12 text-gray-500">No articles found.</li>}
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} tags={article.tags} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
