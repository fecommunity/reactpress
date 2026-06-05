import Link from '@/components/Link';
import { tagLabel, tagValue } from '@/src/utils/tags';
import type { ITag } from '@fecommunity/reactpress-toolkit/types';

interface TagsPageContentProps {
  tags: ITag[];
}

export default function TagsPageContent({ tags }: TagsPageContentProps) {
  const sortedTags = [...tags].sort((a, b) => tagLabel(a).localeCompare(tagLabel(b)));

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          Tags
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          Browse articles by tag
        </p>
      </div>
      <div className="flex max-w-lg flex-wrap py-8">
        {!sortedTags.length && <p className="text-gray-500">No tags yet.</p>}
        {sortedTags.map((tag) => (
          <Link
            key={tagValue(tag)}
            href={`/tag/${encodeURIComponent(tagValue(tag))}`}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 mr-4 mb-4 text-sm font-medium uppercase"
          >
            {tagLabel(tag)}
          </Link>
        ))}
      </div>
    </div>
  );
}
