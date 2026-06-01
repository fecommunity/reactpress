import PageHead from '@/components/PageHead';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations();

  return (
    <>
      <PageHead title="404" description={t('pageNotFound') || 'Page not found.'} />
      <div className="site-container py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <p className="mt-2 text-muted-foreground">{t('pageNotFound') || 'Page not found.'}</p>
        <Link href="/">
          <a className="btn mt-6 inline-flex no-underline">{t('backHome') || 'Back to home'}</a>
        </Link>
      </div>
    </>
  );
}
