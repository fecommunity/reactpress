'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { tagPath, type TaxonomyItem } from '@fecommunity/reactpress-toolkit/theme';
import { TagCloudEngine } from '../lib/tag-cloud';
import { getColorFromNumber } from '../lib/tag-colors';

interface TagsCloudProps {
  tags?: TaxonomyItem[];
  currentTag?: string;
  /** 3D animated cloud — matches client `animationMode`. */
  animated?: boolean;
}

export default function TagsCloud({ tags, currentTag, animated = false }: TagsCloudProps) {
  const items = tags ?? [];
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<TagCloudEngine | null>(null);

  useEffect(() => {
    if (!animated || !containerRef.current || items.length === 0) return undefined;
    const engine = new TagCloudEngine();
    engineRef.current = engine;
    engine.init(containerRef.current);
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [animated, items.length]);

  if (!items.length) return null;

  if (animated) {
    return (
      <div
        ref={containerRef}
        className="tags-cloud tags-cloud--animated"
        data-rp-component="tag-list"
      >
        {items.map((item, index) => {
          const href = tagPath(item.value);
          const active = currentTag === item.value;
          return (
            <Link
              key={item.value}
              href={href}
              className={`tag-link ${active ? 'active' : ''}`}
              style={{ backgroundColor: getColorFromNumber(index) }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="tags-cloud" data-rp-component="tag-list">
      {items.map((item, index) => {
        const href = tagPath(item.value);
        const active = currentTag === item.value;
        return (
          <span key={item.value}>
            <Link
              href={href}
              className={`tag-link ${active ? 'active' : ''}`}
              style={{ backgroundColor: getColorFromNumber(index) }}
            >
              {item.label}
            </Link>
          </span>
        );
      })}
    </div>
  );
}
