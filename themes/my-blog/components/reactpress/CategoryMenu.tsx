'use client';

import Link from '@/components/Link';
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
      className="rounded-t-lg bg-[var(--bg-box)]"
      aria-label={t('categoryTitle')}
    >
      <ul className="m-0 flex list-none flex-nowrap gap-0 overflow-x-auto border-b border-[var(--border-color)] p-2 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap [&::-webkit-scrollbar]:hidden">
        <li className="shrink-0 md:shrink">
          <Link
            href="/"
            className={`inline-block px-4 leading-10 whitespace-nowrap no-underline transition-colors ${
              selectedKey === 'all'
                ? 'border-b-2 border-[var(--primary-color)] text-[var(--primary-color)] dark:border-[#ff6659] dark:text-[#ff6659]'
                : 'border-b-2 border-transparent text-[var(--main-text-color)] hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] dark:hover:border-[#ff6659] dark:hover:text-[#ff6659]'
            }`}
          >
            {t('all')}
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.value} className="shrink-0 md:shrink">
            <Link
              href={`/category/${category.value}`}
              className={`inline-block px-4 leading-10 whitespace-nowrap no-underline transition-colors ${
                selectedKey === category.value
                  ? 'border-b-2 border-[var(--primary-color)] text-[var(--primary-color)] dark:border-[#ff6659] dark:text-[#ff6659]'
                  : 'border-b-2 border-transparent text-[var(--main-text-color)] hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] dark:hover:border-[#ff6659] dark:hover:text-[#ff6659]'
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
