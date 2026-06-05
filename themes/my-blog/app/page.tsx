import ArticleCard from '@/components/ArticleCard';
import Link from '@/components/Link';
import { fetchHomePageProps, themeApi, withApiRetry } from '@fecommunity/reactpress-toolkit/theme/server';

export const revalidate = 60;

export default async function Page() {
  let articles = [];
  let total = 0;

  try {
    const data = await withApiRetry(() => fetchHomePageProps(themeApi));
    articles = data.articles;
    total = data.total;
  } catch (error) {
    console.error('[my-blog] home page fetch failed', error);
  }

  const displayArticles = articles.slice(0, 5);

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          Latest
        </h1>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {!displayArticles.length && <li className="py-12 text-gray-500">No posts found.</li>}
        {displayArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </ul>
      {total > 5 ? (
        <div className="flex justify-end pt-6 text-base leading-6 font-medium">
          <Link href="/blog" className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
            All Posts &rarr;
          </Link>
        </div>
      ) : null}
    </div>
  );
}
