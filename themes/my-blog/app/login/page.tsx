import LoginClient from '@/components/views/LoginClient';
import { buildListPageMetadata } from '@/lib/reactpress/siteMetadata';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return buildListPageMetadata('登录');
}

interface PageProps {
  searchParams: Promise<{ code?: string; from?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { code = '', from = '/' } = await searchParams;
  return <LoginClient code={code} from={from} />;
}
