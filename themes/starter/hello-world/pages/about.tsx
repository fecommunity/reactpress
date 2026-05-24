import { GetStaticProps } from 'next';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  fetchSiteMeta,
  SiteDocument,
  themeApi,
  themeStaticProps,
} from '@fecommunity/reactpress-toolkit/theme';

interface AboutProps {
  siteInfo: { siteName: string; siteDescription: string } | null;
}

export default function About({ siteInfo }: AboutProps) {
  return (
    <SiteDocument
      head={
        <>
          <title>About</title>
          <meta name="description" content="About this site" />
        </>
      }
      header={<Header />}
      footer={<Footer />}
      globalCss="html, body { background: #fff; }"
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
  try {
    const siteInfo = await fetchSiteMeta(themeApi);
    return themeStaticProps({ siteInfo });
  } catch {
    return themeStaticProps({ siteInfo: null });
  }
};
