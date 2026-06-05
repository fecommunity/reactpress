import Link from '@/components/Link';
import ArticleCard from '@/components/ArticleCard';
import {
  fetchTagArchivePageProps,
  fetchCategoryArchivePageProps,
  themeApi,
  withApiRetry,
} from '@fecommunity/reactpress-toolkit/theme/server';
import { notFound } from 'next/navigation';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ tag: string }>;
}

export default async function TagArchivePage({ params }: PageProps) {
  const { tag } = await params;
  const tagValue = decodeURIComponent(tag);

  try {
    const data = await withApiRetry(() => fetchTagArchivePageProps(themeApi, tagValue));
    return (
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            {data.tag.label ?? tagValue}
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            {data.total} article{data.total === 1 ? '' : 's'}
          </p>
          <Link href="/tags" className="text-primary-500 text-sm font-medium">
            &larr; All tags
          </Link>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    console.error('[my-blog] tag archive fetch failed', error);
    notFound();
  }
}
