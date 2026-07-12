import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';
import type { BlogSidebar } from '@docusaurus/plugin-content-blog';
import Heading from '@theme/Heading';
import React, { useMemo } from 'react';

import styles from './styles.module.css';

type Props = {
  sidebar: BlogSidebar;
  variant?: 'desktop' | 'mobile';
};

type SidebarLabels = {
  articles: string;
  releases: string;
  changelog: string;
};

function getLabels(locale: string): SidebarLabels {
  if (locale === 'zh') {
    return {
      articles: '文章',
      releases: '发布说明',
      changelog: '更新日志',
    };
  }
  return {
    articles: 'Articles',
    releases: 'Release notes',
    changelog: 'Changelog',
  };
}

function isChangelogPermalink(permalink: string, changelogPath: string): boolean {
  const normalized = permalink.replace(/\/$/, '');
  const changelog = changelogPath.replace(/\/$/, '');
  return normalized === changelog || normalized.endsWith('/blog/changelog');
}

export default function BlogOrganizedSidebar({ sidebar, variant = 'desktop' }: Props): React.JSX.Element {
  const location = useLocation();
  const changelogPath = useBaseUrl('/blog/changelog');
  const {
    i18n: { currentLocale },
  } = useDocusaurusContext();
  const labels = getLabels(currentLocale);

  const { articles, showChangelogLink } = useMemo(() => {
    const articleItems = sidebar.items.filter((item) => !isChangelogPermalink(item.permalink, changelogPath));
    const hasChangelog = sidebar.items.some((item) => isChangelogPermalink(item.permalink, changelogPath));
    return { articles: articleItems, showChangelogLink: hasChangelog };
  }, [sidebar.items, changelogPath]);

  const isChangelogActive = location.pathname.replace(/\/$/, '') === changelogPath.replace(/\/$/, '');

  return (
    <nav
      className={clsx(
        variant === 'mobile' ? styles.sidebarMobile : styles.sidebar,
        variant === 'desktop' && styles.sidebarDesktopOnly
      )}
      aria-label={currentLocale === 'zh' ? '博客导航' : 'Blog navigation'}
    >
      <div className={styles.title}>{sidebar.title}</div>

      {articles.length > 0 && (
        <div role="group">
          <Heading as="h3" className={styles.sectionHeading}>
            {labels.articles}
          </Heading>
          <ul className={styles.list}>
            {articles.map((item) => {
              const isActive = location.pathname === item.permalink;
              return (
                <li key={item.permalink} className={styles.item}>
                  <Link to={item.permalink} className={isActive ? styles.linkActive : styles.link}>
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {showChangelogLink && (
        <div role="group">
          <Heading as="h3" className={styles.sectionHeading}>
            {labels.releases}
          </Heading>
          <ul className={styles.list}>
            <li className={styles.item}>
              <Link to={changelogPath} className={isChangelogActive ? styles.linkActive : styles.link}>
                {labels.changelog}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
