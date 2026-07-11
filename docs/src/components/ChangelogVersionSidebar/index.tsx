import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useLocation} from '@docusaurus/router';
import type {ChangelogNavItem} from '@site/src/changelog/versions';
import Heading from '@theme/Heading';
import React, {useMemo} from 'react';

import styles from './styles.module.css';

type Props = {
  title: string;
  items: ChangelogNavItem[];
  variant?: 'desktop' | 'mobile';
};

function extractYear(id: string): string {
  const match = id.match(/-(\d{4})-\d{2}-\d{2}$/);
  return match?.[1] ?? 'Other';
}

function groupByYear(items: ChangelogNavItem[]): [string, ChangelogNavItem[]][] {
  const map = new Map<string, ChangelogNavItem[]>();
  for (const item of items) {
    const year = extractYear(item.id);
    const group = map.get(year);
    if (group) {
      group.push(item);
    } else {
      map.set(year, [item]);
    }
  }
  return [...map.entries()].sort((a, b) => Number(b[0]) - Number(a[0]));
}

export default function ChangelogVersionSidebar({
  title,
  items,
  variant = 'desktop',
}: Props): React.JSX.Element {
  const location = useLocation();
  const changelogPath = useBaseUrl('/blog/changelog');
  const isChangelogPage = location.pathname.endsWith('/blog/changelog');
  const groups = useMemo(() => groupByYear(items), [items]);

  return (
    <nav
      className={clsx(
        variant === 'mobile' ? styles.sidebarMobile : styles.sidebar,
        variant === 'desktop' && styles.sidebarDesktopOnly,
      )}
      aria-label="Changelog version navigation">
      <div className={styles.title}>{title}</div>
      {groups.map(([year, yearItems]) => (
        <div key={year} role="group">
          <Heading as="h3" className={styles.yearHeading}>
            {year}
          </Heading>
          <ul className={styles.list}>
            {yearItems.map((item) => {
              const href = isChangelogPage ? `#${item.id}` : `${changelogPath}#${item.id}`;
              const isActive = isChangelogPage && location.hash === `#${item.id}`;
              return (
                <li key={item.id} className={styles.item}>
                  <Link to={href} className={isActive ? styles.linkActive : styles.link}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
