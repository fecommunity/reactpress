'use client';

import ArticleReadingChrome from '@/components/article/ArticleReadingChrome';
import CommentIconButton from '@/components/comment/CommentIconButton';
import BookmarkWidget from '@/components/widgets/BookmarkWidget';
import LikesWidget from '@/components/widgets/LikesWidget';
import ShareWidget from '@/components/widgets/ShareWidget';
import SystemNotification from '@/components/layout/SystemNotification';
import { useSiteCatalog } from '@fecommunity/reactpress-toolkit/theme';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface LikesProps {
  defaultCount?: number;
  id: string;
  api: (id: string, type: 'like' | 'dislike') => Promise<number>;
}

interface DoubleColumnLayoutProps {
  leftNode: ReactNode;
  rightNode?: ReactNode | null;
  topNode?: ReactNode;
  likesProps?: LikesProps;
  bookmarkId?: string;
  showComment?: boolean;
  showShare?: boolean;
  coverPreloadUrl?: string;
  className?: string;
  fillMinHeight?: boolean;
  sidebarCollapsible?: boolean;
}

const TOC_COLLAPSED_KEY = 'rp-toc-collapsed';

export default function DoubleColumnLayout({
  leftNode,
  rightNode,
  topNode,
  likesProps,
  bookmarkId,
  showComment = false,
  showShare = false,
  coverPreloadUrl,
  className = '',
  fillMinHeight = true,
  sidebarCollapsible = false,
}: DoubleColumnLayoutProps) {
  const { locale } = useSiteCatalog();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const hasActions = Boolean(likesProps || bookmarkId || showComment || showShare);
  const useFixedSidebar = Boolean(rightNode) && sidebarCollapsible;
  const showInlineSidebar = Boolean(rightNode) && !sidebarCollapsible;
  const showReadingChrome = hasActions || useFixedSidebar;

  const collapseLabel = locale === 'zh' ? '收起目录' : 'Collapse table of contents';
  const expandLabel = locale === 'zh' ? '展开目录' : 'Expand table of contents';
  const tocLabel = locale === 'zh' ? '目录' : 'TOC';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sidebarCollapsible) return;
    try {
      setSidebarCollapsed(window.localStorage.getItem(TOC_COLLAPSED_KEY) === '1');
    } catch {
      setSidebarCollapsed(false);
    }
  }, [sidebarCollapsible]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(TOC_COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!coverPreloadUrl) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = coverPreloadUrl;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [coverPreloadUrl]);

  const floatingActions =
    hasActions ? (
      <>
        {likesProps ? <LikesWidget {...likesProps} /> : null}
        {bookmarkId ? <BookmarkWidget id={bookmarkId} /> : null}
        {showComment ? <CommentIconButton /> : null}
        {showShare ? <ShareWidget /> : null}
      </>
    ) : null;

  const mobileActions =
    hasActions ? (
      <>
        {likesProps ? <LikesWidget {...likesProps} variant="mobile" /> : null}
        {bookmarkId ? <BookmarkWidget id={bookmarkId} variant="mobile" /> : null}
        {showComment ? <CommentIconButton variant="mobile" /> : null}
        {showShare ? <ShareWidget variant="mobile" /> : null}
      </>
    ) : null;

  const layoutClass = [
    'rp-double-column',
    showReadingChrome ? 'rp-double-column--reading-chrome' : '',
    showInlineSidebar ? 'rp-double-column--sidebar' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const readingChromeProps = {
    actions: floatingActions,
    mobileActions,
    showToc: useFixedSidebar,
    tocExpanded: !sidebarCollapsed,
    onToggleToc: toggleSidebar,
    tocPanel: rightNode,
    collapseLabel,
    expandLabel,
    tocLabel,
  };

  const mobileChromePortal =
    showReadingChrome && mounted
      ? createPortal(
          <ArticleReadingChrome {...readingChromeProps} mode="mobile" />,
          document.body,
        )
      : null;

  const tocChromePortal =
    useFixedSidebar && mounted
      ? createPortal(
          <ArticleReadingChrome {...readingChromeProps} mode="toc" />,
          document.body,
        )
      : null;

  const sideChromePortal =
    showReadingChrome && hasActions && mounted
      ? createPortal(
          <ArticleReadingChrome {...readingChromeProps} mode="side" />,
          document.body,
        )
      : null;

  return (
    <div
      className={`${fillMinHeight ? 'flex min-h-0 flex-1 flex-col' : ''} ${className}`.trim()}
    >
      <SystemNotification />
      {topNode}
      <div className={`${layoutClass} relative pt-4 pb-8`}>
        <section className="rp-double-column__main min-w-0 w-full flex-1 pt-0 pb-6 min-[1280px]:pb-8">
          {leftNode}
        </section>

        {showInlineSidebar ? (
          <aside className="rp-double-column__aside rp-sidebar-slot hidden min-[1280px]:block">
            <div className="rp-sidebar-slot__content">{rightNode}</div>
          </aside>
        ) : null}
      </div>
      {sideChromePortal}
      {mobileChromePortal}
      {tocChromePortal}
    </div>
  );
}
