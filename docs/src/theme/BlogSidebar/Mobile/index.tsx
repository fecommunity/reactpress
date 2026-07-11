import React, {memo} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import type {BlogSidebar} from '@docusaurus/plugin-content-blog';
import type {ChangelogNavItem} from '@site/src/changelog/versions';
import BlogSidebarMobileOriginal from '@theme-original/BlogSidebar/Mobile';

type Props = {
  sidebar: BlogSidebar;
  items?: ChangelogNavItem[];
};

function BlogSidebarMobile(props: Props): React.JSX.Element {
  if (!props.items?.length) {
    return <BlogSidebarMobileOriginal sidebar={props.sidebar} />;
  }

  const changelogBase = useBaseUrl('/blog/changelog');

  return (
    <BlogSidebarMobileOriginal
      sidebar={{
        ...props.sidebar,
        items: props.items.map((item) => ({
          title: item.label,
          permalink: `${changelogBase}#${item.id}`,
          date: item.id.match(/(\d{4}-\d{2}-\d{2})$/)?.[1] ?? '2024-01-01',
        })),
      }}
    />
  );
}

export default memo(BlogSidebarMobile);
