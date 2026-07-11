import {
  ArticleList,
  fetchSearchArticles,
  resolveStaticVisitorContext,
  SiteDocument,
  themeApi,
} from '@fecommunity/reactpress-toolkit/theme';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';

import PageHead from '../components/PageHead';
import PostEntry from '../components/PostEntry';
import { THEME_SHELL } from '../components/ThemeShell';

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

export default function SearchPage({ query = '', articles = [] }: SearchProps) {
  const [keyword, setKeyword] = useState(query);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (trimmed) {
      window.location.href = `/search?keyword=${encodeURIComponent(trimmed)}`;
    }
  };

  return (
    <SiteDocument
      {...THEME_SHELL}
      head={<PageHead title="Search" description="Search articles on this site." />}
    >
      <h1 className="section-title">Search</h1>

      <form className="search-form" onSubmit={handleSubmit} role="search">
        <label htmlFor="search-input" className="visually-hidden">
          Search articles
        </label>
        <input
          id="search-input"
          type="search"
          className="search-input"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search articles…"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {query ? (
        <>
          <p className="results-heading">
            {articles.length} result{articles.length === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
          </p>
          {articles.length > 0 ? (
            <ArticleList
              articles={articles}
              className="archives"
              renderArticle={(article) => <PostEntry key={article.id} article={article} />}
            />
          ) : (
            <>
              <p className="empty-state">No articles matched your search.</p>
              <p>
                <Link href="/">
                  <a>← Back to archives</a>
                </Link>
              </p>
            </>
          )}
        </>
      ) : (
        <p className="empty-state">Enter a keyword to search articles.</p>
      )}
    </SiteDocument>
  );
}

export const getServerSideProps: GetServerSideProps<SearchProps> = async ({ query }) => {
  const reactPress = await resolveStaticVisitorContext();
  const keyword = typeof query.keyword === 'string' ? query.keyword : '';

  if (!keyword.trim()) {
    return { props: { query: '', articles: [], reactPress } };
  }

  try {
    const { query: q, articles } = await fetchSearchArticles(themeApi, keyword);
    return { props: { query: q, articles, reactPress } };
  } catch (error) {
    console.error('[hello-world] search failed', error);
    return {
      props: {
        query: keyword.trim(),
        articles: [],
        reactPress,
      },
    };
  }
};
