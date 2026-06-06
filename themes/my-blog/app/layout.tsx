import './globals.css';

import DevChunkRecovery from '@/components/DevChunkRecovery';
import SiteHeader from '@/components/reactpress/SiteHeader';
import ConditionalSiteFooter from '@/components/reactpress/ConditionalSiteFooter';
import PageContainer from '@/components/reactpress/PageContainer';
import { loadAppBootstrap } from '@/src/reactpress/bootstrap';
import { buildMyBlogAppearanceCss } from '@/src/reactpress/appearance';
import { ReactPressAppProviders } from '@/src/reactpress/providers';
import { buildRootMetadata } from '@/src/reactpress/siteMetadata';
import { colorModeInitScript } from '@fecommunity/reactpress-toolkit/theme/server';
import type { Metadata, Viewport } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildRootMetadata();
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const bootstrap = await loadAppBootstrap('/');
  const appearanceCss = buildMyBlogAppearanceCss(bootstrap.themeMods);
  const basePath = process.env.BASE_PATH || '';

  return (
    <html lang={bootstrap.initialLocale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.gaoredu.com" crossOrigin="anonymous" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`${basePath}/static/favicons/favicon-32x32.png`}
        />
      </head>
      <body className="bg-[var(--bg-body)] text-[var(--main-text-color)] antialiased" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: colorModeInitScript }} />
        {appearanceCss ? (
          <style dangerouslySetInnerHTML={{ __html: appearanceCss }} />
        ) : null}
        <ReactPressAppProviders bootstrap={bootstrap}>
          <DevChunkRecovery />
          <SiteHeader />
          <main id="main-content" className="mb-auto">
            <PageContainer>{children}</PageContainer>
          </main>
          <ConditionalSiteFooter />
        </ReactPressAppProviders>
      </body>
    </html>
  );
}
