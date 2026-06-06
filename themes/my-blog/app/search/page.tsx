import SearchClient from './SearchClient';
import { fetchSearchPageProps, themeApi } from '@fecommunity/reactpress-toolkit/theme/server';

interface PageProps {
  searchParams: Promise<{ keyword?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { keyword = '' } = await searchParams;
  const trimmed = keyword.trim();

  let articles = [];
  try {
    const data = await fetchSearchPageProps(themeApi, trimmed);
    articles = data.articles;
  } catch (error) {
    console.error('[my-blog] search fetch failed', error);
  }

  return <SearchClient keyword={trimmed} articles={articles} />;
}
