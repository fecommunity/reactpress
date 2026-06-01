import { type TaxonomyItem, TaxonomyList } from '@fecommunity/reactpress-toolkit/theme';
import Link from 'next/link';

interface TagsCloudProps {
  tags?: TaxonomyItem[];
  currentTag?: string;
}

export default function TagsCloud({ tags = [], currentTag }: TagsCloudProps) {
  if (!tags.length) return null;

  return (
    <TaxonomyList
      kind="tag"
      items={tags}
      currentValue={currentTag}
      className="flex flex-wrap gap-2"
      renderLink={({ item, href, active }) => (
        <Link href={href}>
          <a
            className={
              active
                ? 'rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary no-underline'
                : 'rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground no-underline hover:bg-secondary/80 hover:text-foreground'
            }
          >
            {item.label}
          </a>
        </Link>
      )}
    />
  );
}
