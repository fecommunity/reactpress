import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArchiveEmptyState,
  ArticleList,
  fetchSearchArticles,
  PageHeader,
  themeApi,
} from '@fecommunity/reactpress-toolkit/theme';
import BlogArticleCard from '../components/BlogArticleCard';
import ThemeShell from '../components/ThemeShell';

interface SearchProps {
  query: string;
  articles: Array<{
    id: string;
    title: string;
    summary?: string;
    cover?: string;
    publishAt?: string;
    category?: { label: string; value: string };
  }>;
}

export default function Search({ query = '', articles = [] }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState(query);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      window.location.href = `/search?keyword=${encodeURIComponent(trimmed)}`;
    }
  };

  return (
    <ThemeShell
      head={
        <>
          <title>{query ? `Search: ${query}` : 'Search'}</title>
          <meta name="description" content="Search articles" />
        </>
      }
    >
      <PageHeader
        className="page-header"
        title="Search"
        titleClassName="page-title"
      />

      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles..."
          className="search-input"
          aria-label="Search"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {!query ? (
        <div className="search-prompt">
          <p>Enter a keyword to search articles.</p>
        </div>
      ) : (
        <>
          <p className="results-heading">
            {articles.length} result{articles.length === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
          </p>
          {articles.length > 0 ? (
            <ArticleList
              articles={articles}
              className="articles-grid"
              renderArticle={(article) => (
                <BlogArticleCard key={article.id} article={article} titleTag="h2" />
              )}
            />
          ) : (
            <div className="no-results">
              <ArchiveEmptyState
                message="No articles matched your search."
                backLabel="← Back to Home"
                renderBackLink={({ href, label }) => (
                  <Link href={href} className="back-home-link">
                    {label}
                  </Link>
                )}
              />
            </div>
          )}
        </>
      )}
    </ThemeShell>
  );
}

export const getServerSideProps: GetServerSideProps<SearchProps> = async ({ query }) => {
  const keyword = typeof query.keyword === 'string' ? query.keyword : '';

  try {
    const data = await fetchSearchArticles(themeApi, keyword);
    return { props: data as SearchProps };
  } catch (error) {
    console.error('[twentytwentyfive] fetch search failed', error);
    return {
      props: {
        query: keyword.trim(),
        articles: [],
      },
    };
  }
};
