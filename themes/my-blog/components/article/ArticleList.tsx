'use client';

import Link from '@/components/shared/Link';
import Logo from '@/components/shared/logo.svg';
import { getColorFromNumber, getTagStyle } from '@/lib/utils/colors';
import { ClockIcon, EyeIcon, FolderIcon, HeartIcon } from '@/lib/utils/icons';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { Image, LocaleTime } from '@fecommunity/reactpress-toolkit/ui/content';
import { useSiteCatalog } from '@fecommunity/reactpress-toolkit/theme';
import { useEffect, useMemo, useRef } from 'react';

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
  animate = false,
}: {
  article: Article;
  categoryIndex: number;
  index: number;
  animate?: boolean;
}) {
  const eager = index < 3;

  return (
    <div
      className={`rp-article-card group/card rp-surface relative flex w-full justify-between overflow-hidden rounded-xl border border-transparent p-4 ring-1 ring-black/5 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--border-color)_70%,transparent)] hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--main-text-color)_10%,transparent),var(--box-shadow)] hover:[&_header_.title]:text-[var(--primary-color)] dark:ring-white/5 [&_img]:transition-transform [&_img]:duration-500 [&_img]:ease-out [&:hover_img]:scale-105 ${
        animate ? 'rp-home-card-enter' : ''
      }`}
    >
      <span
        className="absolute top-5 left-0 h-6 w-1 rounded-r bg-[var(--primary-color)] shadow-sm transition-transform duration-300 group-hover/card:scale-y-110"
        aria-hidden
      />
      <div className="mr-2.5 flex h-[114px] w-[200px] shrink-0 items-center justify-center overflow-hidden rounded-lg max-md:h-20 max-md:w-[140px]">
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
  const animatedCountRef = useRef(0);

  useEffect(() => {
    animatedCountRef.current = articles.length;
  }, [articles]);

  const categoryIndices = useMemo(
    () =>
      articles.map((article) =>
        categories?.findIndex((category) => category?.value === article?.category?.value),
      ),
    [articles, categories],
  );

  const animateFromIndex = animatedCountRef.current;

  return (
    <div className="rp-article-list rp-home-stagger flex w-full flex-col gap-4">
      {articles.length ? (
        articles.map((article, index) => (
          <ArticleCard
            key={article.id}
            article={article}
            categoryIndex={categoryIndices[index]}
            index={index}
            animate={index >= animateFromIndex}
          />
        ))
      ) : (
        <div className="rounded-xl bg-[var(--bg-box)] p-8 text-center text-[var(--second-text-color)]">
          {t('empty')}
        </div>
      )}
    </div>
  );
}
