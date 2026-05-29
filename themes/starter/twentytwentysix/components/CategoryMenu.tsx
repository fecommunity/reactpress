import Link from 'next/link';
import { useRouter } from 'next/router';
import { useThemeT } from '../hooks/useThemeT';

interface CategoryItem {
  value: string;
  label: string;
}

interface CategoryMenuProps {
  categories: CategoryItem[];
}

/** Horizontal category tabs — migrated from client CategoryMenu. */
export default function CategoryMenu({ categories }: CategoryMenuProps) {
  const router = useRouter();
  const t = useThemeT();
  const asPath = router.asPath;

  return (
    <nav className="category-menu" aria-label={t('category.menu.label', 'Categories')}>
      <ul>
        <li className={asPath === '/' ? 'active' : undefined}>
          <Link href="/">{t('common.all', 'All')}</Link>
        </li>
        {categories.map((category) => {
          const href = `/category/${category.value}`;
          const active = asPath === href || asPath.startsWith(`${href}?`);
          return (
            <li key={category.value} className={active ? 'active' : undefined}>
              <Link href={href}>{category.label}</Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
