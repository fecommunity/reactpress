import Link from 'next/link';
import {
  ArchiveEmptyState,
  type TaxonomyItem,
} from '@fecommunity/reactpress-toolkit/theme';
import { useThemeT } from '../hooks/useThemeT';
import CategoryMenu from './CategoryMenu';
import DoubleColumnLayout from './DoubleColumnLayout';
import HomeSidebar from './HomeSidebar';
import InfiniteArticleFeed, { type ArticleFeedSource } from './InfiniteArticleFeed';
import LeftContentWrap from './LeftContentWrap';
import SidebarCategories from './SidebarCategories';
import SystemNotice from './SystemNotice';
import TagsCloud from './TagsCloud';
import TaxonomyHero from './TaxonomyHero';
import WidgetTitle from './ui/WidgetTitle';
import { IconTag } from './ui/icons';

interface ArchivePageViewProps {
  title: string;
  description: string;
  articles: Array<{
    id: string;
    title: string;
    summary?: string;
    cover?: string;
    publishAt?: string;
    views?: number;
    likes?: number;
    category?: { label: string; value: string };
  }>;
  articleTotal: number;
  feedSource: ArticleFeedSource;
  sidebarKind: 'category' | 'tag' | 'home';
  categories?: TaxonomyItem[];
  tags?: TaxonomyItem[];
  recommended?: Array<{ id: string; title: string; views?: number }>;
  currentCategory?: string;
  currentTag?: string;
  emptyMessage: string;
  showCategoryMenu?: boolean;
  heroBackground?: string;
}

export default function ArchivePageView({
  title,
  description,
  articles,
  articleTotal,
  feedSource,
  sidebarKind,
  categories = [],
  tags = [],
  recommended = [],
  currentCategory,
  currentTag,
  emptyMessage,
  showCategoryMenu = false,
  heroBackground,
}: ArchivePageViewProps) {
  const t = useThemeT();
  const backLabel = t('common.backHome', '← Back to Home');
  const tagsWidget = tags.length > 0 ? (
    <div className="widget-card">
      <WidgetTitle icon={<IconTag className="h-4 w-4" />}>{t('sidebar.tags', 'Tags')}</WidgetTitle>
      <TagsCloud tags={tags} currentTag={currentTag} animated />
    </div>
  ) : null;

  const sidebar =
    sidebarKind === 'home' ? (
      <HomeSidebar tags={tags} recommended={recommended} />
    ) : sidebarKind === 'category' ? (
      <>
        <SidebarCategories categories={categories} />
        {tagsWidget}
      </>
    ) : (
      tagsWidget
    );

  const emptyState = (
    <ArchiveEmptyState
      message={emptyMessage}
      backLabel={backLabel}
      renderBackLink={({ href, label }) => (
        <Link href={href} className="back-home-link">
          {label}
        </Link>
      )}
    />
  );

  const articleFeed =
    articles.length > 0 || articleTotal > 0 ? (
      <InfiniteArticleFeed
        source={feedSource}
        initialArticles={articles}
        total={articleTotal}
      />
    ) : (
      emptyState
    );

  return (
    <DoubleColumnLayout
      top={<SystemNotice />}
      main={
        <>
          <TaxonomyHero title={title} subtitle={description} backgroundImage={heroBackground} />
          {showCategoryMenu ? (
            <LeftContentWrap menu={<CategoryMenu categories={categories} />}>
              {articleFeed}
            </LeftContentWrap>
          ) : (
            <div className="article-list-wrapper">{articleFeed}</div>
          )}
        </>
      }
      sidebar={sidebar}
    />
  );
}
