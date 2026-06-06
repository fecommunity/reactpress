'use client';

import Link from '@/components/shared/Link';
import { FolderIcon } from '@/lib/utils/icons';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';

interface Category {
  value: string;
  label: string;
  articleCount?: number;
}

interface CategoriesWidgetProps {
  categories: Category[];
}

export default function CategoriesWidget({ categories = [] }: CategoriesWidgetProps) {
  const { t } = useLocale();

  return (
    <div className="mb-5 overflow-hidden rounded-lg bg-[var(--bg-box)] leading-snug shadow-[var(--box-shadow)]">
      <div className="border-b border-[var(--border-color)] p-4 font-bold text-[var(--main-text-color)]">
        <FolderIcon size={16} className="mr-2 inline-block text-[var(--primary-color)]" />
        <span>{t('categoryTitle')}</span>
      </div>
      <ul className="m-0 list-none p-4">
        {categories.map((category) => (
          <li
            key={category.value}
            className="rounded-lg px-2 py-2 text-[var(--second-text-color)] transition-colors hover:text-[var(--primary-color)]"
          >
            <Link
              href={`/category/${category.value}`}
              aria-label={category.label}
              className="flex w-full items-center justify-between text-sm no-underline hover:text-inherit"
            >
              <span className="text-[var(--main-text-color)]">{category.label}</span>
              <span>
                {t('total')} {category.articleCount ?? 0} {t('articleCountTemplate')}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
