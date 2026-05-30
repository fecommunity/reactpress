import { GetStaticProps } from 'next';
import Link from 'next/link';
import {
  fetchSiteMeta,
  themeApi,
  withThemeStaticProps,
} from '@fecommunity/reactpress-toolkit/theme';
import ThemeShell from '../components/ThemeShell';

interface AboutProps {
  siteInfo: { siteName: string; siteDescription: string } | null;
}

export default function About({ siteInfo }: AboutProps) {
  return (
    <ThemeShell
      head={
        <>
          <title>About</title>
          <meta name="description" content="About this site" />
        </>
      }
    >
      <article className="about-page">
        <h1 className="section-title">About</h1>
        {siteInfo ? (
          <p>
            <strong>{siteInfo.siteName}</strong> — {siteInfo.siteDescription}
          </p>
        ) : (
          <p>Twenty Twenty-Five — a modern ReactPress blog theme.</p>
        )}
        <p>
          <Link href="/">← Back to Home</Link>
        </p>
      </article>
    </ThemeShell>
  );
}

export const getStaticProps: GetStaticProps<AboutProps> = async () =>
  withThemeStaticProps(
    'fetch site meta failed',
    async () => {
      const siteInfo = await fetchSiteMeta(themeApi);
      return { siteInfo };
    },
    { siteInfo: null },
  );
