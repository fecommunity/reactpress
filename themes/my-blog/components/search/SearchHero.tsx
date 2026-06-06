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

interface SearchHeroProps {
  searchCategories?: {
    categories?: SearchCategory[];
    subCategories?: Record<string, SearchSubCategory[]>;
  };
  initialKeyword?: string;
  onLocalSearch?: (keyword: string) => void;
  compact?: boolean;
}

interface Suggestion {
  label: string;
  link: string;
  description?: string;
  external?: boolean;
}

export default function SearchHero({
  searchCategories,
  initialKeyword = '',
  onLocalSearch,
  compact = false,
}: SearchHeroProps) {
  const { t } = useLocale();
  const setting = useSiteSetting();
  const siteTitle = getSiteTitle(setting);
  const categories = searchCategories?.categories || [];
  const subCategories = searchCategories?.subCategories || {};

  const [category, setCategory] = useState(categories[0]?.key || 'local');
  const [subCategory, setSubCategory] = useState(subCategories[categories[0]?.key || 'local']?.[0]?.key);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const subList = subCategories[category] || [];

  useEffect(() => {
    setSubCategory(subCategories[category]?.[0]?.key);
  }, [category, subCategories]);

  useEffect(() => {
    setKeyword(initialKeyword);
  }, [initialKeyword]);

  useEffect(() => {
    if (!compact) inputRef.current?.focus();
  }, [compact]);

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

  useEffect(() => {
    fetchSuggestions(keyword);
  }, [category, subCategory, fetchSuggestions]);

  const handleSearch = () => {
    if (category === 'local') {
      const trimmed = keyword.trim();
      if (!trimmed) return;
      if (onLocalSearch) {
        onLocalSearch(trimmed);
      } else {
        window.location.href = `/search?keyword=${encodeURIComponent(trimmed)}`;
      }
      setOpen(false);
      return;
    }
    const sub = subCategories[category]?.find((item) => item.key === subCategory) ||
      subCategories[category]?.[0];
    if (sub?.url) {
      window.open(`${sub.url}${keyword || '高热度网'}`, '_blank');
    }
  };

  const clearKeyword = () => {
    setKeyword('');
    setOpen(false);
    onLocalSearch?.('');
  };

  return (
    <section
      className={`rp-search-hero ${compact ? 'rp-search-hero--compact' : ''} ${open ? 'is-dropdown-open' : ''}`}
      aria-label={t('searchArticle')}
    >
      <div className="rp-search-hero__backdrop" aria-hidden />
      <div className="rp-search-hero__content">
        {!compact ? (
          <header className="rp-search-hero__header">
            <h1 className="rp-search-hero__title">{t('searchArticle')}</h1>
            {siteTitle ? <p className="rp-search-hero__subtitle">{siteTitle}</p> : null}
          </header>
        ) : null}

        {categories.length ? (
          <div className="rp-search-hero__categories" role="tablist" aria-label={t('searchArticle')}>
            {categories.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={category === item.key}
                onClick={() => {
                  setCategory(item.key);
                  setOpen(true);
                }}
                className={`rp-search-hero__category ${category === item.key ? 'is-active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

        <div ref={wrapRef} className="rp-search-hero__field-wrap">
          <div className="rp-search-hero__field">
            <SearchIcon size={compact ? 20 : 22} className="rp-search-hero__field-icon shrink-0" />
            <input
              ref={inputRef}
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
                if (e.key === 'Escape') setOpen(false);
              }}
              placeholder={t('searchArticlePlaceholder')}
              className="rp-theme-input rp-theme-input-plain min-w-0 flex-1 border-0 bg-transparent text-[15px] text-[var(--main-text-color)] md:text-base"
            />
            {keyword ? (
              <button
                type="button"
                onClick={clearKeyword}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--second-text-color)] transition-colors hover:bg-[var(--bg-second)] hover:text-[var(--main-text-color)]"
              >
                ×
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleSearch}
              className="rp-search-hero__submit rp-primary-button shrink-0 rounded-full font-medium"
            >
              {t('search')}
            </button>
          </div>

          {open ? (
            <ul className="rp-search-hero__dropdown m-0 max-h-[min(50vh,320px)] list-none overflow-auto p-0">
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
          <div className="rp-search-hero__subcats" role="tablist" aria-label={categories.find((c) => c.key === category)?.label}>
            {subList.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={subCategory === item.key}
                onClick={() => {
                  setSubCategory(item.key);
                  setOpen(true);
                }}
                className={`rp-search-hero__subcat ${subCategory === item.key ? 'is-active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
