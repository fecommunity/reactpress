import React, {useEffect, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import BlogSidebarOriginal from '@theme-original/BlogSidebar';
import type {Props} from '@theme/BlogSidebar';
import {CHANGELOG_VERSIONS_EN, CHANGELOG_VERSIONS_ZH} from '@site/src/changelog/versions';
import BlogSidebarDesktop from '@theme/BlogSidebar/Desktop';
import BlogSidebarMobile from '@theme/BlogSidebar/Mobile';

function useIsMobile(breakpoint = 996): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const media = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [breakpoint]);

  return isMobile;
}

/** Blog list and changelog share one aggregated post — show version nav instead of a single sidebar item. */
function useShowChangelogVersionNav(): boolean {
  const location = useLocation();
  return /^(\/zh)?\/blog(\/changelog)?\/?$/.test(location.pathname);
}

export default function BlogSidebar(props: Props): React.JSX.Element | null {
  const showChangelogNav = useShowChangelogVersionNav();
  const isMobile = useIsMobile();
  const {
    i18n: {currentLocale},
  } = useDocusaurusContext();
  const changelogVersions =
    currentLocale === 'zh' ? CHANGELOG_VERSIONS_ZH : CHANGELOG_VERSIONS_EN;

  if (!showChangelogNav) {
    return <BlogSidebarOriginal {...props} />;
  }

  if (!props.sidebar) {
    return null;
  }

  if (isMobile) {
    return (
      <BlogSidebarMobile sidebar={props.sidebar} items={changelogVersions} />
    );
  }

  return (
    <BlogSidebarDesktop sidebar={props.sidebar} items={changelogVersions} />
  );
}
