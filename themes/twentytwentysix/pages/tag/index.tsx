import { GetStaticProps } from 'next';
import {
  fetchTagIndex,
  themeApi,
  withThemeStaticProps,
} from '@fecommunity/reactpress-toolkit/theme';
import DoubleColumnLayout from '../../components/DoubleColumnLayout';
import HomeSidebar from '../../components/HomeSidebar';
import SystemNotice from '../../components/SystemNotice';
import TagsCloud from '../../components/TagsCloud';
import ThemeShell from '../../components/ThemeShell';
import WidgetTitle from '../../components/ui/WidgetTitle';
import { IconTag } from '../../components/ui/icons';
import { useThemeT } from '../../hooks/useThemeT';

interface TagIndexProps {
  tags: Array<{ value: string; label: string; articleCount?: number }>;
}

export default function TagIndexPage({ tags = [] }: TagIndexProps) {
  const t = useThemeT();

  return (
    <ThemeShell
      head={
        <>
          <title>{t('sidebar.tags', '文章标签')}</title>
          <meta name="description" content={t('sidebar.tags', '文章标签')} />
        </>
      }
    >
      <DoubleColumnLayout
        top={<SystemNotice />}
        main={
          <div className="widget-card taxonomy-index-card">
            <WidgetTitle icon={<IconTag className="h-4 w-4" />}>
              {t('sidebar.tags', '文章标签')}
            </WidgetTitle>
            {tags.length > 0 ? (
              <TagsCloud tags={tags} />
            ) : (
              <p className="widget-body empty-state">{t('empty.noData', '暂无数据')}</p>
            )}
          </div>
        }
        sidebar={<HomeSidebar />}
      />
    </ThemeShell>
  );
}

export const getStaticProps: GetStaticProps<TagIndexProps> = async () =>
  withThemeStaticProps(
    'fetch tag index failed',
    () => fetchTagIndex(themeApi),
    { tags: [] },
  );
