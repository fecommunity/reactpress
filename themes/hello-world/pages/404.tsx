import { SiteDocument, resolveStaticVisitorContext, themeStaticProps } from '@fecommunity/reactpress-toolkit/theme';
import { GetStaticProps } from 'next';
import Link from 'next/link';

import PageHead from '../components/PageHead';
import { THEME_SHELL } from '../components/ThemeShell';

export default function NotFound() {
  return (
    <SiteDocument
      {...THEME_SHELL}
      head={<PageHead title="404" description="The requested page could not be found." />}
    >
      <h1 className="section-title">404</h1>
      <p>Page not found.</p>
      <p>
        <Link href="/">
          <a>Back to archives</a>
        </Link>
      </p>
    </SiteDocument>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const reactPress = await resolveStaticVisitorContext();
  return themeStaticProps({ reactPress });
};
