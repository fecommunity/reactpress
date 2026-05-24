import Link from 'next/link';
import { TaxonomyList, type TaxonomyItem } from '@fecommunity/reactpress-toolkit/theme';
import TagsCloud from './TagsCloud';

interface HomeSidebarProps {
  categories?: TaxonomyItem[];
  tags?: TaxonomyItem[];
}

export default function HomeSidebar({ categories = [], tags = [] }: HomeSidebarProps) {
  return (
  <>
      {categories.length > 0 ? (
        <div className="sidebar-widget">
          <h3 className="widget-title">Categories</h3>
          <TaxonomyList
            kind="category"
            variant="list"
            items={categories}
            className="categories-list"
            itemClassName="category-item"
            renderLink={({ item, href }) => (
              <Link href={href} className="category-link">
                <span className="category-name">{item.label}</span>
                <span className="category-count">{item.articleCount ?? 0}</span>
              </Link>
            )}
          />
        </div>
      ) : null}

      {tags.length > 0 ? (
        <div className="sidebar-widget">
          <h3 className="widget-title">Popular Tags</h3>
          <TagsCloud tags={tags} />
        </div>
      ) : null}
    </>
  );
}
