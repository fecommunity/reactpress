import Link from 'next/link';
import { useThemeT } from '../hooks/useThemeT';
import WidgetTitle from './ui/WidgetTitle';
import { IconFolder } from './ui/icons';

interface SidebarCategoriesProps {
  categories: Array<{ value: string; label: string; articleCount?: number }>;
}

export default function SidebarCategories({ categories }: SidebarCategoriesProps) {
  const t = useThemeT();

  if (!categories.length) return null;

  return (
    <div className="widget-card category-list-widget">
      <WidgetTitle icon={<IconFolder className="h-4 w-4" />}>
        {t('sidebar.categories', 'Categories')}
      </WidgetTitle>
      <ul>
        {categories.map((cat) => (
          <li key={cat.value}>
            <Link href={`/category/${cat.value}`}>
              <span>{cat.label}</span>
              <span className="category-count">
                {cat.articleCount ?? 0} {t('common.articlesCount', 'posts')}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
