import Link from '@/components/Link';
import PageTitle from '@/components/PageTitle';
import Tag from '@/components/Tag';
import { formatPublishDate } from '@/src/utils/date';
import { tagLabel, tagValue } from '@/src/utils/tags';
import type { IArticle } from '@fecommunity/reactpress-toolkit/types';

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

interface ArticlePostLayoutProps {
  article: IArticle;
}

export default function ArticlePostLayout({ article }: ArticlePostLayoutProps) {
  const tags = article.tags ?? [];

  return (
    <>
      <article>
        <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
          <header className="pt-6 xl:pb-6">
            <div className="space-y-1 text-center">
              <dl className="space-y-10">
                <div>
                  <dt className="sr-only">Published on</dt>
                  <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                    <time dateTime={article.publishAt}>
                      {formatPublishDate(article.publishAt, 'zh-CN', postDateTemplate)}
                    </time>
                  </dd>
                </div>
              </dl>
              <div>
                <PageTitle>{article.title}</PageTitle>
              </div>
            </div>
          </header>
          <div className="grid-rows-[auto_1fr] divide-y divide-gray-200 pb-8 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0 dark:divide-gray-700">
            <dl className="pt-6 pb-10 xl:border-b xl:border-gray-200 xl:pt-11 xl:dark:border-gray-700">
              <dt className="sr-only">Meta</dt>
              <dd className="text-sm text-gray-500 dark:text-gray-400">
                {article.views != null ? <p>Views: {article.views}</p> : null}
                {article.category ? (
                  <p className="mt-2">
                    <Link href={`/category/${article.category.value}`}>
                      {article.category.label}
                    </Link>
                  </p>
                ) : null}
              </dd>
            </dl>
            <div className="divide-y divide-gray-200 xl:col-span-3 xl:row-span-2 xl:pb-0 dark:divide-gray-700">
              <div
                className="prose dark:prose-invert markdown max-w-none pt-10 pb-8"
                dangerouslySetInnerHTML={{ __html: article.html ?? '' }}
              />
            </div>
            <footer>
              <div className="divide-gray-200 text-sm leading-5 font-medium xl:col-start-1 xl:row-start-2 xl:divide-y dark:divide-gray-700">
                {tags.length > 0 && (
                  <div className="py-4 xl:py-8">
                    <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                      Tags
                    </h2>
                    <div className="flex flex-wrap">
                      {tags.map((tag, index) => (
                        <Tag key={tagValue(tag) || index} text={tagLabel(tag)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-4 xl:pt-8">
                <Link
                  href="/blog"
                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  aria-label="Back to the blog"
                >
                  &larr; Back to the blog
                </Link>
              </div>
            </footer>
          </div>
        </div>
      </article>
    </>
  );
}
