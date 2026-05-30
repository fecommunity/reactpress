import Link from 'next/link';
import {
  ArchiveEmptyState,
  ArchivePageLayout,
  ArticleList,
  PageHeader,
  type TaxonomyItem,
} from '@fecommunity/reactpress-toolkit/theme';
import BlogArticleCard from './BlogArticleCard';
import CategorySidebar from './CategorySidebar';
import TagsCloud from './TagsCloud';

interface ArchivePageViewProps {
  title: string;
  description: string;
  articles: Array<{
    id: string;
    title: string;
    summary?: string;
    cover?: string;
    publishAt?: string;
    category?: { label: string; value: string };
  }>;
  sidebarKind: 'category' | 'tag';
  categories?: TaxonomyItem[];
  tags?: TaxonomyItem[];
  currentCategory?: string;
  currentTag?: string;
  emptyMessage: string;
}

export default function ArchivePageView({
  title,
  description,
  articles,
  sidebarKind,
  categories = [],
  tags = [],
  currentCategory,
  currentTag,
  emptyMessage,
}: ArchivePageViewProps) {
  return (
    <>
      <PageHeader
        className="page-header"
        title={title}
        description={description}
        titleClassName="page-title"
        descriptionClassName="page-description"
      />

      <ArchivePageLayout
        main={
          articles.length > 0 ? (
            <ArticleList
              articles={articles}
              className="articles-grid"
              renderArticle={(article) => (
                <BlogArticleCard key={article.id} article={article} titleTag="h2" />
              )}
            />
          ) : (
            <div className="no-articles">
              <ArchiveEmptyState
                message={emptyMessage}
                renderBackLink={({ href, label }) => (
                  <Link href={href} className="back-home-link">
                    {label}
                  </Link>
                )}
              />
            </div>
          )
        }
        sidebar={
          sidebarKind === 'category' ? (
            <CategorySidebar categories={categories} currentCategory={currentCategory} />
          ) : (
            <div className="sidebar-widget">
              <h3 className="widget-title">Tags</h3>
              <TagsCloud tags={tags} currentTag={currentTag} />
            </div>
          )
        }
      />
    </>
  );
}
