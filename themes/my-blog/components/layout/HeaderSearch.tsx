'use client';

import Link from '@/components/shared/Link';
import { SearchIcon, TOOLBAR_ICON_SIZE, useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { usePathname } from 'next/navigation';

export default function HeaderSearch() {
  const { t } = useLocale();
  const pathname = usePathname();
  const isActive = pathname === '/search';

  return (
    <Link
      href="/search"
      aria-label={t('search')}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--bg-second)] hover:text-[var(--primary-color)] ${
        isActive ? 'text-[var(--primary-color)]' : 'text-[var(--main-text-color)]'
      }`}
    >
      <SearchIcon size={TOOLBAR_ICON_SIZE} />
    </Link>
  );
}
