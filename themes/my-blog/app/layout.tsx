import './globals.css';

import Header from '@/components/Header';
import SectionContainer from '@/components/SectionContainer';
import Footer from '@/components/Footer';
import { loadAppBootstrap } from '@/src/reactpress/bootstrap';
import { buildMyBlogAppearanceCss } from '@/src/reactpress/appearance';
import { resolveSiteShell } from '@/src/reactpress/site-shell';

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const bootstrap = await loadAppBootstrap('/');
  const appearanceCss = buildMyBlogAppearanceCss(bootstrap.themeMods);
  const { siteTitle, navLinks, stickyNav } = resolveSiteShell(bootstrap);
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
      <body className="bg-white text-black antialiased dark:bg-gray-950 dark:text-white">
        {appearanceCss ? (
          <style dangerouslySetInnerHTML={{ __html: appearanceCss }} />
        ) : null}
        <SectionContainer>
          <Header siteTitle={siteTitle} navLinks={navLinks} stickyNav={stickyNav} />
          <main className="mb-auto">{children}</main>
          <Footer siteTitle={siteTitle} />
        </SectionContainer>
      </body>
    </html>
  );
}
