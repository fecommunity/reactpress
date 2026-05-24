import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PostEntry from '../components/PostEntry';
import {
  ArticleList,
  fetchSearchArticles,
  SiteDocument,
  themeApi,
} from '@fecommunity/reactpress-toolkit/theme';

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
      head={
        <>
          <title>Search</title>
          <meta name="description" content="Search articles" />
        </>
      }
      header={<Header />}
      footer={<Footer />}
      globalCss="html, body { background: #fff; }"
    >
      <h1 className="section-title">Search</h1>

      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="search"
          className="search-input"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search articles…"
          aria-label="Search"
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
  const keyword = typeof query.keyword === 'string' ? query.keyword : '';

  if (!keyword.trim()) {
    return { props: { query: '', articles: [] } };
  }

  try {
    const { query: q, articles } = await fetchSearchArticles(themeApi, keyword);
    return { props: { query: q, articles } };
  } catch (error) {
    console.error('[hello-world] search failed', error);
    return {
      props: {
        query: keyword.trim(),
        articles: [],
      },
    };
  }
};
