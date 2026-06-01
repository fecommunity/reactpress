import { SiteSeo } from '@fecommunity/reactpress-toolkit/theme';
import React from 'react';

import Footer from '@/components/Footer';
import Header from '@/components/Header';

interface AppLayoutProps {
  children?: React.ReactNode;
  needFooter?: boolean;
  needHeader?: boolean;
}

export default function AppLayout({
  children,
  needFooter = true,
  needHeader = true,
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col" data-rp-component="layout">
      <SiteSeo />
      {needHeader ? <Header /> : null}
      <main id="main-content" className="flex-1" data-rp-component="main">
        {children}
      </main>
      {needFooter ? <Footer /> : null}
    </div>
  );
}
