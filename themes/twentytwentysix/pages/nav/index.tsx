import DoubleColumnLayout from '@/components/DoubleColumnLayout';
import NavCard, { type NavCardGroup } from '@/components/NavCard';
import PageHead from '@/components/PageHead';
import { PageHeader, useSiteCatalog } from '@fecommunity/reactpress-toolkit/theme';
import { NextPage } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const NavPage: NextPage = () => {
  const t = useTranslations();
  const { siteConfig } = useSiteCatalog();
  const [keyword, setKeyword] = useState('');

  const urlConfig = (siteConfig?.nav?.urlConfig ?? []) as NavCardGroup[];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (trimmed) {
      window.location.href = `/search?keyword=${encodeURIComponent(trimmed)}`;
    }
  };

  return (
    <>
      <PageHead title={t('nav') || 'Navigation'} />
      <DoubleColumnLayout
        top={
          <PageHeader
            title={t('nav') || 'Navigation'}
            titleClassName="text-2xl font-bold tracking-tight"
            description={t('navDescription') || 'Bookmarks and site search.'}
            descriptionClassName="text-muted-foreground"
          />
        }
        main={
          <>
            <form className="mb-8 flex gap-2" onSubmit={handleSearch} role="search">
              <input
                type="search"
                className="input-field flex-1"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t('searchPlaceholder') || 'Search articles…'}
                aria-label={t('search') || 'Search'}
              />
              <button type="submit" className="btn">
                {t('search') || 'Search'}
              </button>
            </form>

            <NavCard groups={urlConfig} />

            <p className="mt-8 text-sm text-muted-foreground">
              <Link href="/search">
                <a className="no-underline">{t('advancedSearch') || 'Advanced search'} →</a>
              </Link>
            </p>
          </>
        }
      />
    </>
  );
};

NavPage.getInitialProps = async () => ({ needLayoutFooter: true });

export default NavPage;
