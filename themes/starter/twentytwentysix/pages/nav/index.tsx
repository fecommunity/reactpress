import { GetStaticProps } from 'next';
import DoubleColumnLayout from '../../components/DoubleColumnLayout';
import NavCategoryMenu from '../../components/NavCategoryMenu';
import NavSites from '../../components/NavSites';
import SystemNotice from '../../components/SystemNotice';
import ThemeShell from '../../components/ThemeShell';
import { useThemeT } from '../../hooks/useThemeT';
import { fetchUrlNavConfig, themeApi, withThemeStaticProps } from '../../lib/fetch';
import type { UrlNavCategory } from '../../lib/fetch';

interface NavPageProps {
  urlConfig: UrlNavCategory[];
}

/** Navigation hub — matches client `/nav` (AdvanceSearch + NavCard). */
export default function NavPage({ urlConfig }: NavPageProps) {
  const t = useThemeT();

  return (
    <ThemeShell head={<title>{t('nav.page.title', '导航')}</title>}>
      <DoubleColumnLayout
        top={
          <>
            <SystemNotice />
            <form className="nav-search-bar" action="/search" method="get" role="search">
              <input
                type="search"
                name="keyword"
                placeholder={t('search.placeholder', '请输入关键字搜索')}
                aria-label={t('common.search', '搜索')}
              />
              <button type="submit">{t('common.search', '搜索')}</button>
            </form>
          </>
        }
        main={
          <div className="nav-page-layout">
            <NavCategoryMenu items={urlConfig} />
            <NavSites items={urlConfig} />
          </div>
        }
      />
    </ThemeShell>
  );
}

export const getStaticProps: GetStaticProps<NavPageProps> = async () =>
  withThemeStaticProps(
    'fetch nav config failed',
    () => fetchUrlNavConfig(themeApi),
    { urlConfig: [] },
  );
