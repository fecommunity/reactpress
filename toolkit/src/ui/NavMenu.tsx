import React from 'react';
import type { NavItem } from '../theme/nav';

export interface NavMenuRenderLinkProps {
  item: NavItem;
  active: boolean;
}

export interface NavMenuProps {
  items: NavItem[];
  activeId?: string;
  className?: string;
  listClassName?: string;
  itemClassName?: string;
  renderLink: (props: NavMenuRenderLinkProps) => React.ReactNode;
}

/** Headless site navigation — styling via theme `renderLink` (e.g. Next.js `Link`). */
export function NavMenu({
  items,
  activeId,
  className,
  listClassName,
  itemClassName,
  renderLink,
}: NavMenuProps) {
  return (
    <nav className={className} data-rp-component="nav" aria-label="Site">
      <ul className={listClassName}>
        {items.map((item) => (
          <li key={item.id} className={itemClassName}>
            {renderLink({ item, active: item.id === activeId })}
          </li>
        ))}
      </ul>
    </nav>
  );
}
