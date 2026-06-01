import DoubleColumnLayout from '@/components/DoubleColumnLayout';
import PageHead from '@/components/PageHead';
import PostEntry from '@/components/PostEntry';
import {
  ArticleList,
  fetchSearchArticles,
  PageHeader,
  themeApi,
} from '@fecommunity/reactpress-toolkit/theme';
import Link from 'next/link';
import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface SearchProps {
  query: string;
  articles: Array<{
    id: string;
    title: string;
    summary?: string;
    publishAt?: string;
    category?: { label: string; value: string };
  }>;
}

const SearchPage: NextPage<SearchProps> = ({ query = '', articles = [] }) => {
  const t = useTranslations();
  const [keyword, setKeyword] = useState(query);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (trimmed) {
      window.location.href = `/search?keyword=${encodeURIComponent(trimmed)}`;
    }
  };

  return (
    <>
      <PageHead title={t('search') || 'Search'} />
      <DoubleColumnLayout
        top={
          <PageHeader
            title={t('search') || 'Search'}
            titleClassName="text-2xl font-bold tracking-tight"
            description={t('searchDescription') || 'Search articles on this site.'}
            descriptionClassName="text-muted-foreground"
          />
        }
        main={
          <>
            <form className="mb-8 flex gap-2" onSubmit={handleSubmit} role="search">
              <label htmlFor="search-input" className="sr-only">
                {t('search') || 'Search'}
              </label>
              <input
                id="search-input"
                type="search"
                className="input-field flex-1"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t('searchPlaceholder') || 'Search articles…'}
              />
              <button type="submit" className="btn">
                {t('search') || 'Search'}
              </button>
            </form>

            {query ? (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  {articles.length} {t('results') || 'results'} &ldquo;{query}&rdquo;
                </p>
                {articles.length > 0 ? (
                  <ArticleList
                    articles={articles}
                    className="space-y-6"
                    renderArticle={(article) => <PostEntry key={article.id} article={article} />}
                  />
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {t('noSearchResults') || 'No articles matched your search.'}
                    </p>
                    <Link href="/">
                      <a className="mt-4 inline-block text-sm no-underline">
                        ← {t('backHome') || 'Back to home'}
                      </a>
                    </Link>
                  </>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('searchHint') || 'Enter a keyword to search articles.'}
              </p>
            )}
          </>
        }
      />
    </>
  );
};

SearchPage.getInitialProps = async (ctx) => {
  const raw = ctx.query.keyword;
  const keyword = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : '';

  if (!keyword?.trim()) {
    return { query: '', articles: [], needLayoutFooter: true };
  }

  try {
    const { query, articles } = await fetchSearchArticles(themeApi, keyword);
    return { query, articles, needLayoutFooter: true };
  } catch (error) {
    console.error('[twentytwentysix] search failed', error);
    return { query: keyword.trim(), articles: [], needLayoutFooter: true };
  }
};

export default SearchPage;
