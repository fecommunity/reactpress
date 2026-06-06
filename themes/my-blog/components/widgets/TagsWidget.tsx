'use client';

import Link from '@/components/shared/Link';
import TagCloud from '@/components/widgets/TagCloud';
import { getColorFromNumber, getTagStyle } from '@/lib/utils/colors';
import { TagIcon } from '@/lib/utils/icons';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { useCallback, useEffect, useState } from 'react';

interface Tag {
  id: string | number;
  value: string;
  label: string;
  articleCount?: number;
}

interface TagsWidgetProps {
  tags: Tag[];
  needTitle?: boolean;
  animationMode?: boolean;
}

const TAG_CLOUD_SKELETON_ITEMS = [
  { top: '16%', left: '18%', width: 68 },
  { top: '28%', left: '56%', width: 54 },
  { top: '42%', left: '8%', width: 76 },
  { top: '50%', left: '42%', width: 48 },
  { top: '64%', left: '24%', width: 62 },
  { top: '70%', left: '58%', width: 52 },
];

function TagCloudSkeleton() {
  return (
    <div className="rp-tag-cloud-skeleton mx-auto my-2" aria-hidden>
      {TAG_CLOUD_SKELETON_ITEMS.map((item, index) => (
        <span
          key={index}
          className="rp-tag-cloud-skeleton-item"
          style={{
            top: item.top,
            left: item.left,
            width: item.width,
            animationDelay: `${index * 80}ms`,
          }}
        />
      ))}
    </div>
  );
}

export default function TagsWidget({
  tags = [],
  needTitle = true,
  animationMode = false,
}: TagsWidgetProps) {
  const { t } = useLocale();
  const [cloudReady, setCloudReady] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    setCloudReady(false);
  }, [tags]);

  const handleCloudReadyChange = useCallback((ready: boolean) => {
    setCloudReady(ready);
  }, []);

  const showCloudSkeleton = animationMode && tags.length > 0 && (!hydrated || !cloudReady);

  return (
    <div className="rp-widget-panel mb-5 overflow-hidden rounded-xl bg-[var(--bg-box)] leading-snug shadow-[var(--box-shadow)] ring-1 ring-black/5 dark:ring-white/5">
      {needTitle ? (
        <div className="border-b border-[var(--border-color)] p-4 font-bold text-[var(--main-text-color)]">
          <TagIcon size={16} className="mr-2 inline-block text-[var(--primary-color)]" />
          <span>{t('tagTitle')}</span>
        </div>
      ) : null}

      {animationMode ? (
        <>
          <div className="relative mx-auto my-2 h-[260px] w-[250px] max-w-full">
            {showCloudSkeleton ? <TagCloudSkeleton /> : null}
            {tags.length > 0 ? (
              <TagCloud
                className={`transition-opacity duration-300 ${cloudReady ? 'opacity-100' : 'opacity-0'}`}
                onReadyChange={handleCloudReadyChange}
                aria-hidden
              >
                {tags.map((tag, index) => (
                  <a
                    key={tag.id}
                    href={`/tag/${tag.value}`}
                    tabIndex={-1}
                    aria-hidden
                    style={getTagStyle(getColorFromNumber(index))}
                  >
                    {tag.label}
                  </a>
                ))}
              </TagCloud>
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-sm text-[var(--second-text-color)]">
                {t('empty')}
              </div>
            )}
          </div>
          <nav aria-label={t('tagTitle')} className="sr-only">
            <ul>
              {tags.map((tag) => (
                <li key={tag.id}>
                  <Link href={`/tag/${tag.value}`}>{tag.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      ) : tags.length ? (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-4">
          {tags.map((tag, index) => (
            <li key={tag.id} className="m-0 p-0">
              <Link
                href={`/tag/${tag.value}`}
                aria-label={tag.label}
                className="inline-block rounded px-2 py-1 text-sm no-underline transition-all duration-200 hover:scale-105 hover:opacity-90 hover:shadow-sm"
                style={getTagStyle(getColorFromNumber(index))}
              >
                {tag.label}
                {typeof tag.articleCount === 'number' ? ` [${tag.articleCount}]` : ''}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-6 text-center text-sm text-[var(--second-text-color)]">{t('empty')}</div>
      )}
    </div>
  );
}
