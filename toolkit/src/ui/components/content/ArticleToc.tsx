import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface TocItem {
  level: number;
  id: string;
  text: string;
}

export interface ArticleTocProps {
  items: TocItem[];
  className?: string;
  listClassName?: string;
  itemClassName?: string;
  activeClassName?: string;
  maxHeight?: string | number;
  title?: React.ReactNode;
  showTitle?: boolean;
  indentStep?: number;
}

function elementInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top >= 0 && rect.top <= window.innerHeight * 0.4;
}

/** Headless table-of-contents for article pages. */
export function ArticleToc({
  items,
  className = 'rp-article-toc',
  listClassName = 'rp-article-toc-list',
  itemClassName = 'rp-article-toc-item',
  activeClassName = 'is-active',
  maxHeight = '80vh',
  title = 'Contents',
  showTitle = true,
  indentStep = 12,
}: ArticleTocProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const goto = useCallback((item: TocItem) => {
    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!items.length) return undefined;
    const onScroll = () => {
      items.reduceRight((_, item, index) => {
        const el = document.getElementById(item.id);
        if (el && elementInViewport(el)) {
          setActive(index);
          if (listRef.current) listRef.current.scrollTop = 32 * index;
        }
        return null;
      }, null);
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    return () => document.removeEventListener('scroll', onScroll);
  }, [items]);

  if (!items.length) return null;

  return (
    <nav className={className} data-rp-component="article-toc">
      {showTitle ? <header className="rp-article-toc-title">{title}</header> : null}
      <div
        ref={listRef}
        className={listClassName}
        style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight, overflow: 'auto' }}
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`${itemClassName}${index === active ? ` ${activeClassName}` : ''}`}
            style={{ paddingLeft: indentStep * (Math.max(1, Number(item.level) || 1) - 1) }}
            onClick={() => goto(item)}
            dangerouslySetInnerHTML={{ __html: item.text }}
          />
        ))}
      </div>
    </nav>
  );
}

/** Parse TOC JSON stored on article records. Supports legacy `[level, id, text]` tuples. */
export function parseArticleToc(raw?: string | null): TocItem[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry): TocItem | null => {
        if (Array.isArray(entry) && entry.length >= 3) {
          const level = Number(entry[0]);
          return {
            level: Number.isFinite(level) ? level : 1,
            id: String(entry[1]),
            text: String(entry[2]),
          };
        }
        if (entry && typeof entry === 'object') {
          const row = entry as Record<string, unknown>;
          const level = Number(row.level);
          if (!row.id) return null;
          return {
            level: Number.isFinite(level) ? level : 1,
            id: String(row.id),
            text: String(row.text ?? ''),
          };
        }
        return null;
      })
      .filter((item): item is TocItem => item != null);
  } catch {
    return [];
  }
}
