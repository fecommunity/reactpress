import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import {
  createArchiveGetStaticProps,
  fetchTagArchive,
  themeOnDemandPaths,
  useRouteParam,
} from '@fecommunity/reactpress-toolkit/theme';
import ArchivePageView from '../../components/ArchivePageView';
import ThemeShell from '../../components/ThemeShell';

interface TagProps {
  tag: string;
  articles: any[];
  tags: any[];
}

export default function TagPage({ tag: tagProp, articles = [], tags = [] }: TagProps) {
  const router = useRouter();
  const tag = useRouteParam(tagProp, 'tag');

  if (router.isFallback) {
    return (
      <ThemeShell head={<title>Loading…</title>}>
        <p className="loading-state">Loading…</p>
      </ThemeShell>
    );
  }

  const tagData = tags.find((t) => t?.value === tag);
  const tagName = tagData?.label ?? tag;

  return (
    <ThemeShell
      head={
        <>
          <title>{`Tag: ${tagName}`}</title>
          <meta name="description" content={`Articles tagged ${tagName}`} />
        </>
      }
    >
      <ArchivePageView
        title={`Tag: ${tagName}`}
        description={`${articles.length} article${articles.length === 1 ? '' : 's'} with this tag`}
        articles={articles}
        sidebarKind="tag"
        tags={tags}
        currentTag={tag}
        emptyMessage="There are no articles with this tag yet."
      />
    </ThemeShell>
  );
}

export const getStaticPaths: GetStaticPaths = async () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps<TagProps> = createArchiveGetStaticProps(
  'tag',
  fetchTagArchive,
  (tag) => ({ tag, articles: [], tags: [] }),
);
