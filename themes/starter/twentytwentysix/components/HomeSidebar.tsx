import type { TaxonomyItem } from '@fecommunity/reactpress-toolkit/theme';
import { useThemeT } from '../hooks/useThemeT';
import AboutCard from './AboutCard';
import RecommendList from './RecommendList';
import TagsCloud from './TagsCloud';
import WidgetTitle from './ui/WidgetTitle';
import { IconTag } from './ui/icons';

interface HomeSidebarProps {
  tags?: TaxonomyItem[];
  recommended?: Array<{ id: string; title: string; views?: number }>;
}

export default function HomeSidebar({ tags = [], recommended = [] }: HomeSidebarProps) {
  const t = useThemeT();

  return (
    <>
      <RecommendList articles={recommended} />
      {tags.length > 0 ? (
        <div className="widget-card">
          <WidgetTitle icon={<IconTag className="h-4 w-4" />}>
            {t('sidebar.tags', 'Tags')}
          </WidgetTitle>
          <TagsCloud tags={tags} animated />
        </div>
      ) : null}
      <AboutCard />
    </>
  );
}
