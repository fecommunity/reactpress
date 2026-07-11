import React, {memo} from 'react';
import type {BlogSidebar} from '@docusaurus/plugin-content-blog';
import type {ChangelogNavItem} from '@site/src/changelog/versions';
import ChangelogVersionSidebar from '@site/src/components/ChangelogVersionSidebar';
import BlogSidebarDesktopOriginal from '@theme-original/BlogSidebar/Desktop';

type Props = {
  sidebar: BlogSidebar;
  items?: ChangelogNavItem[];
};

function BlogSidebarDesktop(props: Props): React.JSX.Element {
  if (!props.items?.length) {
    return <BlogSidebarDesktopOriginal sidebar={props.sidebar} />;
  }

  return (
    <aside className="col col--3">
      <ChangelogVersionSidebar title={props.sidebar.title} items={props.items} />
    </aside>
  );
}

export default memo(BlogSidebarDesktop);
