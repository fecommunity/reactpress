import { GetStaticProps } from 'next';
import {
  fetchTagIndex,
  PageHeader,
  themeApi,
  withThemeStaticProps,
} from '@fecommunity/reactpress-toolkit/theme';
import TagsCloud from '../../components/TagsCloud';
import ThemeShell from '../../components/ThemeShell';

interface TagIndexProps {
  tags: Array<{ value: string; label: string; articleCount?: number }>;
}

export default function TagIndexPage({ tags = [] }: TagIndexProps) {
  return (
    <ThemeShell
      head={
        <>
          <title>Tags</title>
          <meta name="description" content="Browse articles by tag" />
        </>
      }
    >
      <PageHeader
        className="page-header"
        title="Tags"
        description={`${tags.length} tag${tags.length === 1 ? '' : 's'}`}
        titleClassName="page-title"
        descriptionClassName="page-description"
      />

      {tags.length > 0 ? (
        <motion className="sidebar-widget">
          <TagsCloud tags={tags} />
        </motion>
      ) : (
        <p className="loading-state">No tags yet.</p>
      )}
    </ThemeShell>
  );
}

export const getStaticProps: GetStaticProps<TagIndexProps> = async () =>
  withThemeStaticProps(
    'fetch tag index failed',
    () => fetchTagIndex(themeApi),
    { tags: [] },
  );
