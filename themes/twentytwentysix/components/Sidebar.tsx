import { type TaxonomyItem, TaxonomyList } from '@fecommunity/reactpress-toolkit/theme';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations();
  const hasCategories = categories.length > 0;
  const hasTags = tags.length > 0;

  if (!hasCategories && !hasTags) return null;

  return (
    <aside className="space-y-6">
      {hasCategories ? (
        <section className="card-surface">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t('categoryTitle') || 'Categories'}
          </h2>
          <TaxonomyList
            kind="category"
            variant="list"
            items={categories}
            currentValue={currentCategory}
            className="space-y-1"
            renderLink={({ item, href, active }) => (
              <Link href={href}>
                <a
                  className={
                    active
                      ? 'font-medium text-primary no-underline'
                      : 'text-sm text-muted-foreground no-underline hover:text-foreground'
                  }
                >
                  {item.label}
                  {item.articleCount != null ? (
                    <span className="ml-1 text-xs opacity-70">({item.articleCount})</span>
                  ) : null}
                </a>
              </Link>
            )}
          />
        </section>
      ) : null}

      {hasTags ? (
        <section className="card-surface">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t('tagTitle') || 'Tags'}
          </h2>
          <TagsCloud tags={tags} currentTag={currentTag} />
        </section>
      ) : null}
    </aside>
  );
}
