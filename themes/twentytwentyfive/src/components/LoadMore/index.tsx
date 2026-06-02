import { useEffect, useRef } from 'react';

interface LoadMoreProps {
  hasMore: boolean;
  loadMore: (page: number) => void;
  pageStart?: number;
  loader?: React.ReactNode;
  children: React.ReactNode;
}

/** Lightweight infinite scroll — replaces react-infinite-scroller. */
export function LoadMore({ hasMore, loadMore, pageStart = 1, loader, children }: LoadMoreProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(pageStart);
  const loadingRef = useRef(false);

  useEffect(() => {
    pageRef.current = pageStart;
  }, [pageStart]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loadingRef.current || !hasMore) return;
        loadingRef.current = true;
        const next = pageRef.current + 1;
        Promise.resolve(loadMore(next)).finally(() => {
          pageRef.current = next;
          loadingRef.current = false;
        });
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <>
      {children}
      {hasMore ? (
        <div ref={sentinelRef} aria-hidden>
          {loader}
        </div>
      ) : null}
    </>
  );
}
