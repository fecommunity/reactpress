'use client';

import Link from '@/components/shared/Link';
import { SearchIcon } from '@/lib/utils/icons';
import { ArticleProvider, SearchProvider } from '@/lib/providers/client';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { jsonp } from '@fecommunity/reactpress-toolkit/theme';
import { getSiteTitle, useSiteSetting } from '@fecommunity/reactpress-toolkit/theme';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SearchCategory {
  key: string;
  label: string;
}

interface SearchSubCategory {
  key: string;
  label: string;
  url?: string;
}

interface NavAdvanceSearchProps {
  searchCategories?: {
    categories?: SearchCategory[];
    subCategories?: Record<string, SearchSubCategory[]>;
  };
}

interface Suggestion {
  label: string;
  link: string;
  description?: string;
  external?: boolean;
}

export default function NavAdvanceSearch({ searchCategories }: NavAdvanceSearchProps) {
  const { t } = useLocale();
  const setting = useSiteSetting();
  const siteTitle = getSiteTitle(setting);
  const categories = searchCategories?.categories || [];
  const subCategories = searchCategories?.subCategories || {};

  const [category, setCategory] = useState(categories[0]?.key || 'local');
  const [subCategory, setSubCategory] = useState(subCategories[categories[0]?.key || 'local']?.[0]?.key);
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const subList = subCategories[category] || [];

  useEffect(() => {
    setSubCategory(subCategories[category]?.[0]?.key);
  }, [category, subCategories]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const fetchSuggestions = useCallback(
    (value: string) => {
      setLoading(true);
      if (category === 'local') {
        const request = value.trim()
          ? SearchProvider.searchArticles(value)
          : ArticleProvider.getRecommend();
        return request
          .then((res) => {
            setSuggestions(
              res
                .filter((item) => !item.status || item.status === 'publish')
                .map((item) => ({
                  label: item.title,
                  link: `/article/${item.id}`,
                  description: item.summary,
                })),
            );
          })
          .catch(() => setSuggestions([]))
          .finally(() => setLoading(false));
      }

      const sub = subCategories[category]?.find((item) => item.key === subCategory) ||
        subCategories[category]?.[0];

      return new Promise<void>((resolve) => {
        jsonp('https://suggestion.baidu.com/su', { wd: value || '高热度网' }, (res) => {
          const data = res as { s?: string[] } | Error;
          if (data instanceof Error || !data?.s) {
            const fallback = value || '高热度网';
            setSuggestions([
              {
                label: fallback,
                link: sub?.url ? `${sub.url}${fallback}` : '#',
                external: Boolean(sub?.url),
              },
            ]);
          } else {
            setSuggestions(
              data.s.map((item) => ({
                label: item,
                link: sub?.url ? `${sub.url}${item}` : '#',
                external: Boolean(sub?.url),
              })),
            );
          }
          setLoading(false);
          resolve();
        });
      });
    },
    [category, subCategory, subCategories],
  );

  const handleSearch = () => {
    if (category === 'local') {
      if (keyword.trim()) {
        window.location.href = `/search?keyword=${encodeURIComponent(keyword.trim())}`;
      }
      return;
    }
    const sub = subCategories[category]?.find((item) => item.key === subCategory) ||
      subCategories[category]?.[0];
    if (sub?.url) {
      window.open(`${sub.url}${keyword || '高热度网'}`, '_blank');
    }
  };

  return (
    <section className="rp-nav-search mb-6 mt-4 rounded-lg bg-[var(--bg-box)] px-6 py-5 shadow-[var(--box-shadow)]">
      <h1 className="m-0 text-center text-2xl font-semibold text-[var(--main-text-color)]">
        {t('nav')} - {siteTitle}
      </h1>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {categories.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setCategory(item.key);
              fetchSuggestions(keyword);
            }}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              category === item.key
                ? 'rp-primary-button'
                : 'bg-[var(--bg-second)] text-[var(--main-text-color)] hover:text-[var(--primary-color)]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div ref={wrapRef} className="relative mx-auto mt-4 max-w-3xl">
        <div className="flex h-12 items-center rounded-full border border-[var(--border-color)] bg-[var(--bg-box)] pl-4 pr-2">
          <input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              fetchSuggestions(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              fetchSuggestions(keyword);
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            placeholder={t('searchArticlePlaceholder')}
            className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-[var(--main-text-color)] outline-none"
          />
          <button
            type="button"
            onClick={handleSearch}
            aria-label={t('search')}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--primary-color)] transition-colors hover:bg-[var(--bg-second)]"
          >
            <SearchIcon size={22} />
          </button>
        </div>

        {open ? (
          <ul className="rp-nav-search-dropdown absolute top-[calc(100%+8px)] z-50 m-0 max-h-[50vh] w-full list-none overflow-auto rounded-lg border border-[var(--border-color)] bg-[var(--bg-box)] p-0 shadow-[var(--box-shadow)]">
            {loading ? (
              <li className="px-4 py-3 text-center text-sm text-[var(--second-text-color)]">
                {t('gettingArticle')}
              </li>
            ) : suggestions.length ? (
              suggestions.slice(0, 10).map((item) => (
                <li key={`${item.link}-${item.label}`} className="border-b border-[var(--border-color)] last:border-b-0">
                  {item.external ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-3 no-underline hover:bg-[var(--bg-second)]"
                      onClick={() => setOpen(false)}
                    >
                      <div className="text-sm font-medium text-[var(--main-text-color)] hover:text-[var(--primary-color)]">
                        {item.label}
                      </div>
                    </a>
                  ) : (
                    <Link
                      href={item.link}
                      className="block px-4 py-3 no-underline hover:bg-[var(--bg-second)]"
                      onClick={() => setOpen(false)}
                    >
                      <div className="text-sm font-medium text-[var(--main-text-color)] hover:text-[var(--primary-color)]">
                        {item.label}
                      </div>
                      {item.description ? (
                        <p
                          className="rp-rich-text m-0 mt-1 line-clamp-1 text-xs text-[var(--second-text-color)]"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      ) : null}
                    </Link>
                  )}
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-center text-sm text-[var(--second-text-color)]">{t('empty')}</li>
            )}
          </ul>
        ) : null}
      </div>

      {subList.length > 0 ? (
        <div className="rp-nav-subcats mt-4 flex flex-wrap justify-center gap-6 border-t border-[var(--border-color)] pt-3">
          {subList.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setSubCategory(item.key);
                fetchSuggestions(keyword);
              }}
              className={`relative border-0 bg-transparent px-1 py-1 text-sm transition-colors ${
                subCategory === item.key
                  ? 'rp-nav-subcats-active font-medium text-[var(--primary-color)]'
                  : 'text-[var(--main-text-color)] hover:text-[var(--primary-color)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
