import LoginClient from '@/components/views/LoginClient';
import { buildNoIndexMetadata } from '@/lib/reactpress/siteMetadata';
import { tServer } from '@/lib/reactpress/serverLocale';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return buildNoIndexMetadata(await tServer('pageTitleLogin'), '/login');
}

interface PageProps {
  searchParams: Promise<{ code?: string; from?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { code = '', from = '/' } = await searchParams;
  return <LoginClient code={code} from={from} />;
}
