'use client';

import CommentIconButton from '@/components/comment/CommentIconButton';
import LikesWidget from '@/components/widgets/LikesWidget';
import SystemNotification from '@/components/layout/SystemNotification';
import { getDocumentScrollTop } from '@/lib/utils/scroll';
import { useToggle } from '@fecommunity/reactpress-toolkit/theme';
import { type ReactNode, useEffect } from 'react';

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
  showComment?: boolean;
  coverPreloadUrl?: string;
}

export default function DoubleColumnLayout({
  leftNode,
  rightNode,
  topNode,
  likesProps,
  showComment = false,
  coverPreloadUrl,
}: DoubleColumnLayoutProps) {
  const [showWidget, toggleWidget] = useToggle(true);

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

  useEffect(() => {
    let beforeY = 0;
    let ticking = false;
    const handler = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = getDocumentScrollTop();
        toggleWidget(beforeY <= y);
        beforeY = y;
        ticking = false;
      });
    };
    document.addEventListener('scroll', handler, { passive: true });
    return () => document.removeEventListener('scroll', handler);
  }, [toggleWidget]);

  const hasFloating = Boolean(likesProps || showComment);

  return (
    <div className="min-h-screen">
      <SystemNotification />
      {topNode}
      <div className="rp-double-column relative flex flex-wrap pt-4 pb-8">
        {hasFloating ? (
          <div
            className={`rp-floating-widgets rp-floating-widget fixed top-[30vh] z-10 hidden -translate-x-full flex-col gap-3 xl:flex ${
              showWidget ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            {likesProps ? <LikesWidget {...likesProps} /> : null}
            {showComment ? <CommentIconButton /> : null}
          </div>
        ) : null}
        {hasFloating ? (
          <div
            className={`fixed right-0 bottom-0 left-0 z-10 flex h-[52px] border-t border-[var(--border-color)] bg-[color-mix(in_srgb,var(--bg-box)_92%,transparent)] backdrop-blur-md transition-[transform,opacity] duration-300 ease-out xl:hidden ${
              showWidget ? '-translate-y-full opacity-100' : 'translate-y-0 opacity-95'
            }`}
          >
            {likesProps ? (
              <div className="flex flex-1 items-center justify-center">
                <LikesWidget {...likesProps} />
              </div>
            ) : null}
            {showComment ? (
              <div className="flex flex-1 items-center justify-center">
                <CommentIconButton />
              </div>
            ) : null}
          </div>
        ) : null}

        <section className="min-w-0 flex-1 pt-0 pb-8 max-md:w-full md:w-[calc(100%-19rem-1rem)]">
          {leftNode}
        </section>
        {rightNode ? (
          <aside className="ml-0 w-full pt-0 pb-4 max-md:hidden md:ml-4 md:w-72">
            {rightNode}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
