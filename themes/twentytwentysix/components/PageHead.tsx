import {
  getPageTitle,
  isLikelyValidAssetPath,
  resolvePublicAssetUrl,
  useSiteMeta,
} from '@fecommunity/reactpress-toolkit/theme';
import Head from 'next/head';
import { useRouter } from 'next/router';

export interface PageHeadProps {
  title: string;
  description?: string;
}

export default function PageHead({ title, description }: PageHeadProps) {
  const { siteName, siteDescription, siteFavicon, siteUrl } = useSiteMeta();
  const router = useRouter();
  const fullTitle = getPageTitle(title, { systemTitle: siteName }, siteName);
  const metaDescription = description ?? siteDescription;
  const showFavicon = isLikelyValidAssetPath(siteFavicon);
  const favicon = showFavicon ? resolvePublicAssetUrl(siteFavicon) : '';
  const path = router.asPath.split('?')[0] || '/';
  const canonical = siteUrl ? `${siteUrl.replace(/\/$/, '')}${path}` : undefined;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
      <meta name="robots" content="max-image-preview:large" />
      {showFavicon && favicon ? (
        <>
          <link rel="icon" href={favicon} />
          <link rel="apple-touch-icon" href={favicon} />
        </>
      ) : (
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      )}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
    </Head>
  );
}
