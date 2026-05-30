import Link from 'next/link';
import { useThemeT } from '../hooks/useThemeT';
import WidgetTitle from './ui/WidgetTitle';
import { IconEye, IconSparkles } from './ui/icons';

interface RecommendListProps {
  articles: Array<{ id: string; title: string; views?: number }>;
}

/** Sidebar numbered recommend list. */
export default function RecommendList({ articles }: RecommendListProps) {
  const t = useThemeT();
  const list = articles.slice(0, 6);

  return (
    <div className="widget-card">
      <WidgetTitle icon={<IconSparkles className="h-4 w-4" />}>
        {t('sidebar.recommend', 'Recommended')}
      </WidgetTitle>
      {list.length ? (
        <ul className="recommend-list">
          {list.map((article, index) => (
            <li key={article.id}>
              <Link href={`/article/${article.id}`}>
                <span className="title-text" data-num={index + 1}>
                  {article.title}
                </span>
                <span className="views">
                  <IconEye className="views-icon" />
                  {article.views ?? 0}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="widget-body empty-state">{t('empty.noRecommend', 'No recommendations')}</p>
      )}
    </div>
  );
}
