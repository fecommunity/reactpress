'use client';

import Link from '@/components/shared/Link';
import TagCloud from '@/components/widgets/TagCloud';
import { getColorFromNumber, getTagStyle } from '@/lib/utils/colors';
import { TagIcon } from '@/lib/utils/icons';
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
        <>
          <TagCloud className="mx-auto my-2" aria-hidden>
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
      ) : (
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
      )}
    </div>
  );
}
