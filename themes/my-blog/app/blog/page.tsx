import ArticleCard from '@/components/ArticleCard';
import { fetchHomePageProps, themeApi, withApiRetry } from '@fecommunity/reactpress-toolkit/theme/server';

export const revalidate = 60;

export default async function BlogPage() {
  let articles = [];
  let total = 0;

  try {
    const data = await withApiRetry(() => fetchHomePageProps(themeApi));
    articles = data.articles;
    total = data.total;
  } catch (error) {
    console.error('[my-blog] blog page fetch failed', error);
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          Blog
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">{total} articles</p>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {!articles.length && <li className="py-12 text-gray-500">No posts found.</li>}
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </ul>
    </div>
  );
}
