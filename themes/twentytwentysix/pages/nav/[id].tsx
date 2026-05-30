import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { themeOnDemandPaths } from '@fecommunity/reactpress-toolkit/theme';
import DoubleColumnLayout from '../../components/DoubleColumnLayout';
import HomeSidebar from '../../components/HomeSidebar';
import SystemNotice from '../../components/SystemNotice';
import ThemeShell from '../../components/ThemeShell';
import { useThemeT } from '../../hooks/useThemeT';
import {
  fetchUrlNavConfig,
  findUrlNavItem,
  themeApi,
  withThemeStaticProps,
  type UrlNavCategory,
} from '../../lib/fetch';

interface NavPreviewProps {
  site: UrlNavCategory | null;
}

/** Site preview iframe — matches client `/nav/[id]`. */
export default function NavPreviewPage({ site }: NavPreviewProps) {
  const router = useRouter();
  const t = useThemeT();

  if (router.isFallback) {
    return (
      <ThemeShell head={<title>{t('common.loading', '加载中…')}</title>}>
        <p className="loading-state">{t('common.loading', '加载中…')}</p>
      </ThemeShell>
    );
  }

  if (!site?.url) {
    return (
      <ThemeShell head={<title>{t('nav.preview.notFound', '站点不存在')}</title>}>
        <p className="empty-state">{t('nav.preview.notFound', '站点不存在')}</p>
        <Link href="/nav" className="back-home-link">
          {t('nav.preview.back', '← 返回导航')}
        </Link>
      </ThemeShell>
    );
  }

  const icon =
    site.url && /^https?:\/\//.test(site.url)
      ? `${new URL(site.url).origin}/favicon.ico`
      : undefined;

  return (
    <ThemeShell head={<title>{site.label}</title>}>
      <DoubleColumnLayout
        top={
          <>
            <SystemNotice />
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/nav">{t('nav.page.title', '导航')}</Link>
              <span aria-hidden="true"> / </span>
              <span>{site.label}</span>
            </nav>
          </>
        }
        main={
          <article className="widget-card nav-preview-card">
            <header className="nav-preview-header">
              {icon ? <img src={icon} alt="" width={48} height={48} /> : null}
              <div>
                <h1>{site.label}</h1>
                {site.description ? <p className="lead">{site.description}</p> : null}
              </div>
            </header>
            <div className="nav-preview-notice">
              {t(
                'nav.preview.warning',
                '本站只做内容预览，不做任何信息存储，请注意您的账号和财产安全。',
              )}
            </div>
            <iframe
              title={site.label}
              src={site.url}
              className="nav-preview-frame"
              allowFullScreen
            />
            <a
              href={site.url}
              target="_blank"
              rel="noreferrer"
              className="btn-primary nav-preview-open"
            >
              {t('nav.preview.open', '打开网站')}
            </a>
          </article>
        }
        sidebar={<HomeSidebar />}
      />
    </ThemeShell>
  );
}

export const getStaticPaths: GetStaticPaths = async () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps<NavPreviewProps> = async ({ params }) => {
  const raw = params?.id as string | undefined;
  const siteKey = raw?.replace(/\.html$/i, '') ?? '';

  return withThemeStaticProps(
    'fetch nav site failed',
    async () => {
      const { urlConfig } = await fetchUrlNavConfig(themeApi);
      return { site: findUrlNavItem(urlConfig, siteKey) };
    },
    { site: null },
  );
};
