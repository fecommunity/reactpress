'use client';

import Link from '@/components/Link';
import TagCloud from '@/components/reactpress/TagCloud';
import { getColorFromNumber } from '@/src/utils/colors';
import { TagIcon } from '@/src/utils/icons';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';

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

export default function TagsWidget({
  tags = [],
  needTitle = true,
  animationMode = false,
}: TagsWidgetProps) {
  const { t } = useLocale();

  return (
    <div className="mb-5 overflow-hidden rounded-lg bg-[var(--bg-box)] leading-snug shadow-[var(--box-shadow)]">
      {needTitle ? (
        <div className="border-b border-[var(--border-color)] p-4 font-bold text-[var(--main-text-color)]">
          <TagIcon size={16} className="mr-2 inline-block text-[var(--primary-color)]" />
          <span>{t('tagTitle')}</span>
        </div>
      ) : null}

      {animationMode ? (
        <TagCloud className="mx-auto my-2">
          {tags.map((tag, index) => (
            <a
              key={tag.id}
              href={`/tag/${tag.value}`}
              aria-label={tag.label}
              style={{ backgroundColor: getColorFromNumber(index) }}
            >
              {tag.label}
            </a>
          ))}
        </TagCloud>
      ) : (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-4">
          {tags.map((tag, index) => (
            <li key={tag.id} className="m-0 p-0">
              <Link
                href={`/tag/${tag.value}`}
                aria-label={tag.label}
                className="inline-block rounded px-2 py-1 text-sm text-white no-underline transition-all duration-200 hover:scale-105 hover:opacity-90 hover:shadow-sm"
                style={{ backgroundColor: getColorFromNumber(index) }}
              >
                {tag.label}
                {typeof tag.articleCount === 'number' ? ` [${tag.articleCount}]` : ''}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
