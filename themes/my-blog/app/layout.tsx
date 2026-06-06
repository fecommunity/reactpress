import './globals.css';

import SiteHeader from '@/components/reactpress/SiteHeader';
import ConditionalSiteFooter from '@/components/reactpress/ConditionalSiteFooter';
import PageContainer from '@/components/reactpress/PageContainer';
import { loadAppBootstrap } from '@/src/reactpress/bootstrap';
import { buildMyBlogAppearanceCss } from '@/src/reactpress/appearance';
import { ReactPressAppProviders } from '@/src/reactpress/providers';

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const bootstrap = await loadAppBootstrap('/');
  const appearanceCss = buildMyBlogAppearanceCss(bootstrap.themeMods);
  const basePath = process.env.BASE_PATH || '';

  return (
    <html lang={bootstrap.initialLocale} suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`${basePath}/static/favicons/favicon-32x32.png`}
        />
      </head>
      <body className="bg-[var(--bg-body)] text-[var(--main-text-color)] antialiased">
        {appearanceCss ? (
          <style dangerouslySetInnerHTML={{ __html: appearanceCss }} />
        ) : null}
        <ReactPressAppProviders bootstrap={bootstrap}>
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
