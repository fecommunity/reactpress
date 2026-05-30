import { SiteDocument } from '@fecommunity/reactpress-toolkit/theme';
import Link from 'next/link';

import Footer from '../components/Footer';
import Header from '../components/Header';

export default function NotFound() {
  return (
    <SiteDocument
      head={<title>404</title>}
      header={<Header />}
      footer={<Footer />}
      globalCss="html, body { background: #fff; }"
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
