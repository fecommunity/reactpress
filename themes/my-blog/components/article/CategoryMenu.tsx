'use client';

import Link from '@/components/shared/Link';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

interface Category {
  value: string;
  label: string;
}

interface CategoryMenuProps {
  categories: Category[];
}

function normalizePath(pathname: string | null) {
  const raw = (pathname ?? '/').replace(/\/$/, '') || '/';
  return raw;
}

export default function CategoryMenu({ categories }: CategoryMenuProps) {
  const { t } = useLocale();
  const pathname = usePathname();
  const normalizedPath = normalizePath(pathname);
  const isHome = normalizedPath === '/';

  const selectedKey = useMemo(() => {
    if (isHome) return 'all';
    const categorySlug = normalizedPath.replace(/^\/category\//, '');
    const active = categories.find((category) => category.value === categorySlug);
    return active?.value ?? '';
  }, [normalizedPath, categories, isHome]);

  return (
    <nav
      className="rp-category-menu-glass rounded-t-xl"
      aria-label={t('categoryTitle')}
    >
      <ul className="m-0 flex list-none flex-nowrap gap-0 overflow-x-auto border-b border-[color-mix(in_srgb,var(--border-color)_65%,transparent)] p-2 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap [&::-webkit-scrollbar]:hidden">
        <li className="shrink-0 md:shrink">
          <Link
            href="/"
            className={`inline-block rounded-lg px-4 leading-10 whitespace-nowrap no-underline transition-all duration-300 ${
              selectedKey === 'all'
                ? 'bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] font-medium text-[var(--primary-color)] dark:text-[#ff6659]'
                : 'text-[var(--main-text-color)] hover:bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)] hover:text-[var(--primary-color)] dark:hover:text-[#ff6659]'
            }`}
          >
            {t('all')}
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.value} className="shrink-0 md:shrink">
            <Link
              href={`/category/${category.value}`}
              className={`inline-block rounded-lg px-4 leading-10 whitespace-nowrap no-underline transition-all duration-300 ${
                selectedKey === category.value
                  ? 'bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] font-medium text-[var(--primary-color)] dark:text-[#ff6659]'
                  : 'text-[var(--main-text-color)] hover:bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)] hover:text-[var(--primary-color)] dark:hover:text-[#ff6659]'
              }`}
            >
              {category.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
