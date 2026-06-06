'use client';

import Link from '@/components/shared/Link';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';

export default function NotFound() {
  const { t } = useLocale();

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="m-0 text-6xl font-bold text-[var(--primary-color)]">404</h1>
      <p className="mt-4 text-lg text-[var(--main-text-color)]">{t('pageMissing')}</p>
      <Link
        href="/"
        className="rp-primary-action mt-6 inline-block rounded-xl bg-[var(--primary-color)] px-6 py-2.5 text-white no-underline hover:opacity-95"
      >
        {t('backHome')}
      </Link>
    </div>
  );
}
