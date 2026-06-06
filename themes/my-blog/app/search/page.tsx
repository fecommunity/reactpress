import SearchClient from '@/components/views/SearchClient';
import { buildListPageMetadata } from '@/lib/reactpress/siteMetadata';
import { fetchSearchPageProps, themeApi } from '@fecommunity/reactpress-toolkit/theme/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return buildListPageMetadata('搜索');
}

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
