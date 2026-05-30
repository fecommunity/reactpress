import Link from 'next/link';
import { TaxonomyList, type TaxonomyItem } from '@fecommunity/reactpress-toolkit/theme';

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
      className="tags-cloud"
      renderLink={({ item, href, active }) => (
        <Link href={href}>
          <a className={active ? 'active' : ''}>{item.label}</a>
        </Link>
      )}
    />
  );
}
