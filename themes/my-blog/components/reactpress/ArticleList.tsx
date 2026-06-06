'use client';

import Link from '@/components/Link';
import Logo from '@/data/logo.svg';
import { getColorFromNumber, getTagStyle } from '@/src/utils/colors';
import { ClockIcon, EyeIcon, FolderIcon, HeartIcon } from '@/src/utils/icons';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { Image, LocaleTime } from '@fecommunity/reactpress-toolkit/ui/content';
import { useSiteCatalog } from '@fecommunity/reactpress-toolkit/theme';
import { useMemo } from 'react';

interface Article {
  id: string;
  title: string;
  cover?: string;
  summary: string;
  category?: { value: string; label: string };
  likes: number;
  views: number;
  publishAt: string;
}

interface ArticleListProps {
  articles: Article[];
}

const COVER_WIDTH = 200;
const COVER_HEIGHT = 114;

function ArticleCard({
  article,
  categoryIndex,
  index,
}: {
  article: Article;
  categoryIndex: number;
  index: number;
}) {
  const eager = index < 3;

  return (
    <div className="rp-article-card relative flex w-full justify-between overflow-hidden rounded-lg bg-[var(--bg-box)] p-4 shadow-[var(--box-shadow)] transition-colors hover:[&_header_.title]:text-[var(--primary-color)] [&_img]:transition-transform [&:hover_img]:scale-110">
      <span
        className="absolute top-5 left-0 h-6 w-1 rounded-r bg-[var(--primary-color)] shadow-sm"
        aria-hidden
      />
      <div className="mr-2.5 flex h-[114px] w-[200px] shrink-0 items-center justify-center overflow-hidden rounded-[5px] max-md:h-20 max-md:w-[140px]">
        {article.cover ? (
          <Link href={`/article/${article.id}`} className="block h-full w-full">
            <Image
              url={article.cover}
              size="thumb"
              alt={`${article.title} cover`}
              width={COVER_WIDTH}
              height={COVER_HEIGHT}
              loading={eager ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : undefined}
              decoding={index === 0 ? 'sync' : 'async'}
              className="h-full w-full object-cover"
            />
          </Link>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--bg-second)]">
            <Logo className="h-12 w-auto max-w-[155px] object-contain" aria-label="ReactPress" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <header className="flex items-start gap-1">
          <Link
            href={`/article/${article.id}`}
            className="title line-clamp-2 min-w-0 flex-1 text-base leading-snug font-semibold text-[var(--main-text-color)] no-underline"
          >
            {article.title}
          </Link>
          {article.category && categoryIndex >= 0 ? (
            <Link
              href={`/category/${article.category.value}`}
              className="rp-category-tag ml-1 inline-flex shrink-0 items-center gap-1 rounded px-2 py-0.5 text-xs no-underline transition-all duration-200 hover:opacity-80 hover:shadow-sm"
              style={getTagStyle(getColorFromNumber(categoryIndex))}
            >
              <FolderIcon size={12} className="opacity-90" />
              <span>{article.category.label}</span>
            </Link>
          ) : null}
        </header>
        <Link href={`/article/${article.id}`} className="mt-2 block no-underline">
          <main className="flex flex-col justify-between">
            <div
              className="rp-rich-text line-clamp-2 text-sm text-[var(--second-text-color)] max-md:line-clamp-1"
              dangerouslySetInnerHTML={{ __html: article.summary }}
            />
            <div className="mt-3 flex items-center justify-between whitespace-nowrap text-sm text-[#8590a6]">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center text-[var(--second-text-color)]">
                  <HeartIcon size={14} />
                  <span className="ml-1.5">{article.likes}</span>
                </span>
                <span>·</span>
                <span className="inline-flex items-center text-[var(--second-text-color)]">
                  <EyeIcon size={14} />
                  <span className="ml-1.5">{article.views}</span>
                </span>
              </div>
              <span className="inline-flex items-center max-md:hidden">
                <ClockIcon size={14} />
                <span className="ml-1.5">
                  <LocaleTime date={article.publishAt} format="yyyy-MM-dd" />
                </span>
              </span>
            </div>
          </main>
        </Link>
      </div>
    </div>
  );
}

export default function ArticleList({ articles = [] }: ArticleListProps) {
  const { t } = useLocale();
  const { categories } = useSiteCatalog();

  const categoryIndices = useMemo(
    () =>
      articles.map((article) =>
        categories?.findIndex((category) => category?.value === article?.category?.value),
      ),
    [articles, categories],
  );

  return (
    <div className="rp-article-list flex w-full flex-col gap-4">
      {articles.length ? (
        articles.map((article, index) => (
          <ArticleCard
            key={article.id}
            article={article}
            categoryIndex={categoryIndices[index]}
            index={index}
          />
        ))
      ) : (
        <div className="rounded-lg bg-[var(--bg-box)] p-8 text-center text-[var(--second-text-color)]">
          {t('empty')}
        </div>
      )}
    </div>
  );
}
