import { ArchivePageLayout } from '@fecommunity/reactpress-toolkit/theme';
import cls from 'classnames';
import React from 'react';

interface DoubleColumnLayoutProps {
  main: React.ReactNode;
  sidebar?: React.ReactNode;
  top?: React.ReactNode;
  className?: string;
}

/** 双栏布局 — 主内容 + 侧栏，基于 toolkit ArchivePageLayout。 */
export default function DoubleColumnLayout({
  main,
  sidebar,
  top,
  className,
}: DoubleColumnLayoutProps) {
  return (
    <div className={cls('site-container py-8', className)}>
      {top}
      <ArchivePageLayout
        className="content-grid"
        mainClassName="min-w-0 space-y-6"
        sidebarClassName="space-y-6 lg:sticky lg:top-24 lg:self-start"
        main={main}
        sidebar={sidebar}
      />
    </div>
  );
}
