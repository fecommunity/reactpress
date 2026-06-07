import React from 'react';
import { categoryPath, tagPath } from '../../theme/content/nav';

export interface TaxonomyItem {
  value: string;
  label: string;
  articleCount?: number;
}

export interface TaxonomyListRenderLinkProps {
  item: TaxonomyItem;
  href: string;
  active: boolean;
}

export type TaxonomyListVariant = 'inline' | 'list';

export interface TaxonomyListProps {
  items: TaxonomyItem[];
  kind: 'category' | 'tag';
  /** `list` → `ul`/`li` (sidebar); `inline` → flex-friendly wrappers (tag cloud). */
  variant?: TaxonomyListVariant;
  currentValue?: string;
  className?: string;
  itemClassName?: string;
  hrefFor?: (item: TaxonomyItem) => string;
  renderLink: (props: TaxonomyListRenderLinkProps) => React.ReactNode;
}

function defaultHref(kind: 'category' | 'tag', item: TaxonomyItem): string {
  return kind === 'category' ? categoryPath(item.value) : tagPath(item.value);
}

/** Headless category/tag list (sidebar, footer, tag cloud). */
export function TaxonomyList({
  items,
  kind,
  variant = 'inline',
  currentValue,
  className,
  itemClassName,
  hrefFor,
  renderLink,
}: TaxonomyListProps) {
  const safeItems = Array.isArray(items) ? items : [];
  const resolveHref = hrefFor ?? ((item) => defaultHref(kind, item));
  const component = `${kind}-list`;

  const nodes = safeItems.map((item) => {
    const href = resolveHref(item);
    const link = renderLink({
      item,
      href,
      active: currentValue === item.value,
    });
    if (variant === 'list') {
      return (
        <li key={item.value} className={itemClassName}>
          {link}
        </li>
      );
    }
    return (
      <span key={item.value} className={itemClassName}>
        {link}
      </span>
    );
  });

  if (variant === 'list') {
    return (
      <ul className={className} data-rp-component={component}>
        {nodes}
      </ul>
    );
  }

  return (
    <div className={className} data-rp-component={component}>
      {nodes}
    </div>
  );
}
