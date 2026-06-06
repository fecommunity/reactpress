import LoginClient from './LoginClient';

interface PageProps {
  searchParams: Promise<{ code?: string; from?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { code = '', from = '/' } = await searchParams;
  return <LoginClient code={code} from={from} />;
}
