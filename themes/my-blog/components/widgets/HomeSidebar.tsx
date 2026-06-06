'use client';

import AboutUs from '@/components/widgets/AboutUs';
import ArticleRecommend from '@/components/article/ArticleRecommend';
import CategoriesWidget from '@/components/widgets/CategoriesWidget';
import TagsWidget from '@/components/widgets/TagsWidget';
import { useSiteCatalog } from '@fecommunity/reactpress-toolkit/theme';

interface HomeSidebarProps {
  showTags?: boolean;
  showCategories?: boolean;
  deferRecommend?: boolean;
}

export default function HomeSidebar({
  showTags = true,
  showCategories = false,
  deferRecommend = true,
}: HomeSidebarProps) {
  const { tags, categories } = useSiteCatalog();

  return (
    <div className="rp-sidebar-sticky sticky mb-4 w-72">
      <ArticleRecommend mode="inline" deferFetch={deferRecommend} />
      {showTags ? (
        <TagsWidget
          tags={tags as Parameters<typeof TagsWidget>[0]['tags']}
          animationMode
        />
      ) : null}
      {showCategories ? (
        <CategoriesWidget categories={categories as Parameters<typeof CategoriesWidget>[0]['categories']} />
      ) : null}
      <AboutUs variant="sidebar" />
    </div>
  );
}
