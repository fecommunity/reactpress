import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import style from './index.module.scss';

interface CategoryMenuProps {
  categories: ICategory[];
}

export const CategoryMenu = ({ categories }: CategoryMenuProps) => {
  const t = useTranslations();
  const router = useRouter();
  const { asPath, pathname } = router;
  const isHome = pathname === '/';

  const selectedKey = useMemo(() => {
    if (isHome) return 'all';
    const active = categories.find((category) => asPath.replace('/category/', '') === category.value);
    return active?.value ?? '';
  }, [asPath, categories, isHome]);

  return (
    <nav className={style.menu} aria-label={String(t('categoryTitle'))}>
      <ul className={style.menuList}>
        <li>
          <Link href="/" shallow={false}>
            <a className={selectedKey === 'all' ? style.active : undefined}>{t('all')}</a>
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.value}>
            <Link href="/category/[category]" as={`/category/${category.value}`} shallow={false}>
              <a className={selectedKey === category.value ? style.active : undefined}>{category.label}</a>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
