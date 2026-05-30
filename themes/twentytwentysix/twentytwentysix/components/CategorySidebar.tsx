import Link from 'next/link';
import { TaxonomyList, type TaxonomyItem } from '@fecommunity/reactpress-toolkit/theme';
import TagsCloud from './TagsCloud';

interface CategorySidebarProps {
  categories?: TaxonomyItem[];
  currentCategory?: string;
}

export default function CategorySidebar({
  categories = [],
  currentCategory,
}: CategorySidebarProps) {
  if (!categories.length) return null;

  return (
    <div className="sidebar-widget">
      <h3 className="widget-title">All Categories</h3>
      <TaxonomyList
        kind="category"
        variant="list"
        items={categories}
        currentValue={currentCategory}
        className="categories-list"
        itemClassName="category-item"
        renderLink={({ item, href, active }) => (
          <Link href={href} className={`category-link${active ? ' active' : ''}`}>
            <span className="category-name">{item.label}</span>
            <span className="category-count">{item.articleCount ?? 0}</span>
          </Link>
        )}
      />
    </div>
  );
}
