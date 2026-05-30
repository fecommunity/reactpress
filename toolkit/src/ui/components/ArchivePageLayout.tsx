import React from 'react';

export interface ArchivePageLayoutProps {
  main: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
  mainClassName?: string;
  sidebarClassName?: string;
}

/** Two-column archive layout (main list + sidebar widgets). */
export function ArchivePageLayout({
  main,
  sidebar,
  className = 'content-layout',
  mainClassName = 'articles-section',
  sidebarClassName = 'sidebar',
}: ArchivePageLayoutProps) {
  return (
    <div className={className} data-rp-component="archive-layout">
      <section className={mainClassName}>{main}</section>
      {sidebar ? <aside className={sidebarClassName}>{sidebar}</aside> : null}
    </div>
  );
}
