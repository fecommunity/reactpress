import Link from 'next/link';
import { TaxonomyList, type TaxonomyItem } from '@fecommunity/reactpress-toolkit/theme';
import TagsCloud from './TagsCloud';

interface SidebarProps {
  categories?: TaxonomyItem[];
  tags?: TaxonomyItem[];
  currentCategory?: string;
  currentTag?: string;
}

export default function Sidebar({
  categories = [],
  tags = [],
  currentCategory,
  currentTag,
}: SidebarProps) {
  const hasCategories = categories.length > 0;
  const hasTags = tags.length > 0;

  if (!hasCategories && !hasTags) return null;

  return (
    <aside className="sidebar">
      {hasCategories ? (
        <section>
          <h2 className="widget-title">Categories</h2>
          <TaxonomyList
            kind="category"
            variant="list"
            items={categories}
            currentValue={currentCategory}
            className="taxonomy-list"
            renderLink={({ item, href, active }) => (
              <Link href={href}>
                <a className={active ? 'active' : ''}>
                  {item.label}
                  {item.articleCount != null ? (
                    <span className="count">({item.articleCount})</span>
                  ) : null}
                </a>
              </Link>
            )}
          />
        </section>
      ) : null}

      {hasTags ? (
        <section>
          <h2 className="widget-title">Tags</h2>
          <TagsCloud tags={tags} currentTag={currentTag} />
        </section>
      ) : null}
    </aside>
  );
}
