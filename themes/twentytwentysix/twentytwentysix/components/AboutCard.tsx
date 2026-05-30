import { useSiteMeta } from '@fecommunity/reactpress-toolkit/theme';
import { useThemeT } from '../hooks/useThemeT';
import WidgetTitle from './ui/WidgetTitle';
import { IconInfo } from './ui/icons';

/** Sidebar about card. */
export default function AboutCard() {
  const meta = useSiteMeta();
  const t = useThemeT();

  return (
    <div className="widget-card">
      <WidgetTitle icon={<IconInfo className="h-4 w-4" />}>
        {t('sidebar.about', 'About')}
      </WidgetTitle>
      <div className="widget-body">
        {meta.siteDescription ? (
          <p className="about-desc">{meta.siteDescription}</p>
        ) : (
          <p className="about-desc">
            {t('about.defaultDesc', 'A technical blog sharing frontend tools and resources.')}
          </p>
        )}
      </div>
    </div>
  );
}
