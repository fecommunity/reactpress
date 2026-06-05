import type { GetServerSideProps } from 'next';
import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslations } from 'next-intl';

import { AdvanceSearch } from '@/components/AdvanceSearch';
import NavCard from '@/components/NavCard';
import SystemNotification from '@/components/Setting/SystemNotification';
import {
  DEFAULT_VISITOR_LOCALES,
  fetchSiteNavConfig,
  resolveVisitorLocale,
  sanitizeNextProps,
  useSiteSetting,
  type SiteNavConfig,
} from '@fecommunity/reactpress-toolkit/theme';
import { SettingProvider } from '@/providers';

import themeManifest from '../../theme.json';

import style from './index.module.scss';

interface IHomeProps {
  navConfig?: SiteNavConfig;
}

const Page: NextPage<IHomeProps> = ({ navConfig }) => {
  const setting = useSiteSetting();
  const t = useTranslations();
  return (
    <div className={style.wrapper}>
      <Head>
        <title>{`${t('nav')} - ${t('categoryArticle')} - ${setting.systemTitle}`}</title>
      </Head>
      <div className="container">
        <SystemNotification />
        <div className={style.search}>
          <AdvanceSearch searchCategories={navConfig?.searchCategories} />
        </div>
        <div className={style.content}>
          <NavCard dataSource={navConfig?.urlConfig} />
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const locale = resolveVisitorLocale([...DEFAULT_VISITOR_LOCALES], ctx.req);
  const navConfig = await fetchSiteNavConfig({
    locale,
    manifest: themeManifest,
    getSetting: () => SettingProvider.getSetting(),
  });

  return {
    props: sanitizeNextProps({
      navConfig,
      needLayoutFooter: true,
    }),
  };
};

export default Page;
