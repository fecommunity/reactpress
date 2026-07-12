import React, { useEffect, useState } from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import BlogOrganizedSidebar from '@site/src/components/BlogOrganizedSidebar';
import { CHANGELOG_VERSIONS_EN, CHANGELOG_VERSIONS_ZH } from '@site/src/changelog/versions';
import type { Props } from '@theme/BlogSidebar';
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

/** Changelog page only — version anchors replace the default post list. */
function useIsChangelogPage(): boolean {
  const location = useLocation();
  return /^(\/zh)?\/blog\/changelog\/?$/.test(location.pathname);
}

export default function BlogSidebar(props: Props): React.JSX.Element | null {
  const isChangelogPage = useIsChangelogPage();
  const isMobile = useIsMobile();
  const {
    i18n: { currentLocale },
  } = useDocusaurusContext();
  const changelogVersions = currentLocale === 'zh' ? CHANGELOG_VERSIONS_ZH : CHANGELOG_VERSIONS_EN;

  if (!props.sidebar) {
    return null;
  }

  if (isChangelogPage) {
    if (isMobile) {
      return <BlogSidebarMobile sidebar={props.sidebar} items={changelogVersions} />;
    }
    return <BlogSidebarDesktop sidebar={props.sidebar} items={changelogVersions} />;
  }

  if (isMobile) {
    return <BlogOrganizedSidebar sidebar={props.sidebar} variant="mobile" />;
  }

  return (
    <aside className="col col--3">
      <BlogOrganizedSidebar sidebar={props.sidebar} variant="desktop" />
    </aside>
  );
}
