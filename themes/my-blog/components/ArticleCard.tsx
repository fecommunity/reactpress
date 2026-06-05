import Link from '@/components/Link';

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    summary?: string;
    publishAt?: string;
    category?: { label?: string; value?: string };
  };
  tags?: Array<{ label?: string; value?: string } | string>;
}

export default function ArticleCard({ article, tags = [] }: ArticleCardProps) {
  const displayTags =
    tags.length > 0
      ? tags
      : article.category
        ? [{ label: article.category.label, value: article.category.value }]
        : [];

  const date = article.publishAt
    ? new Date(article.publishAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <li className="py-12">
      <article>
        <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
          <dl>
            <dt className="sr-only">Published on</dt>
            <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
              <time dateTime={article.publishAt}>{date}</time>
            </dd>
          </dl>
          <div className="space-y-5 xl:col-span-3">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl leading-8 font-bold tracking-tight">
                  <Link href={`/article/${article.id}`} className="text-gray-900 dark:text-gray-100">
                    {article.title}
                  </Link>
                </h2>
                {displayTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {displayTags.map((tag, index) => {
                      const label = typeof tag === 'string' ? tag : tag?.label ?? tag?.value ?? '';
                      const value = typeof tag === 'string' ? tag : tag?.value ?? label;
                      return (
                        <Link
                          key={value || index}
                          href={`/tag/${encodeURIComponent(value)}`}
                          className="text-primary-500 text-sm font-medium uppercase"
                        >
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
              {article.summary ? (
                <div className="prose max-w-none text-gray-500 dark:text-gray-400">{article.summary}</div>
              ) : null}
            </div>
            <div className="text-base leading-6 font-medium">
              <Link
                href={`/article/${article.id}`}
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Read more &rarr;
              </Link>
            </div>
          </div>
        </div>
      </article>
    </li>
  );
}
