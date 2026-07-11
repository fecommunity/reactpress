import {
  fetchSiteMeta,
  resolveStaticVisitorContext,
  SiteDocument,
  themeApi,
  themeStaticProps,
} from '@fecommunity/reactpress-toolkit/theme';
import { GetStaticProps } from 'next';
import Link from 'next/link';

import PageHead from '../components/PageHead';
import { THEME_SHELL } from '../components/ThemeShell';

interface AboutProps {
  siteInfo: { siteName: string; siteDescription: string } | null;
}

export default function About({ siteInfo }: AboutProps) {
  return (
    <SiteDocument
      {...THEME_SHELL}
      head={<PageHead title="About" description="About this site." />}
    >
      <h1 className="section-title">About</h1>
      {siteInfo ? (
        <>
          <p>
            <strong>{siteInfo.siteName}</strong> — {siteInfo.siteDescription}
          </p>
        </>
      ) : (
        <p>
          ReactPress hello-world starter theme — copy this folder to build your own theme.
        </p>
      )}

      <hr className="hello-hr" aria-hidden="true" />

      <p>
        <Link href="/toolkit-demo">
          <a>Toolkit demo</a>
        </Link>
        {' · '}
        <Link href="/">
          <a>Archives</a>
        </Link>
      </p>
    </SiteDocument>
  );
}

export const getStaticProps: GetStaticProps<AboutProps> = async () => {
  const reactPress = await resolveStaticVisitorContext();
  try {
    const siteInfo = await fetchSiteMeta(themeApi);
    return themeStaticProps({ siteInfo, reactPress });
  } catch {
    return themeStaticProps({ siteInfo: null, reactPress });
  }
};
