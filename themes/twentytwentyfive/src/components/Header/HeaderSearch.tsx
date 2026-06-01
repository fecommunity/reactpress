import cls from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';

import { SearchIcon, TOOLBAR_ICON_SIZE } from '@fecommunity/reactpress-toolkit/ui';

import style from './HeaderSearch.module.scss';

export function HeaderSearch() {
  const t = useTranslations();
  const { pathname } = useRouter();
  const isActive = pathname === '/search';

  return (
    <Link href="/search" scroll={false}>
      <a className={cls(style.searchLink, isActive && style.active)} aria-label={t('search')}>
        <SearchIcon size={TOOLBAR_ICON_SIZE} />
        <span className={style.label}>{t('search')}</span>
      </a>
    </Link>
  );
}
