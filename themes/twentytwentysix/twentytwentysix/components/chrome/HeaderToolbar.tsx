import Link from 'next/link';
import { useThemeT } from '../../hooks/useThemeT';
import { IconGithub, IconSearch } from '../ui/icons';
import ColorSchemeToggle from './ColorSchemeToggle';
import LocaleToggle from './LocaleToggle';

const GITHUB_URL = 'https://github.com/fecommunity/reactpress';

/** Header right-side actions — matches blog.gaoredu.com tool row. */
export default function HeaderToolbar() {
  const t = useThemeT();

  return (
    <div className="rp-toolbar header-tools" data-rp-component="header-toolbar">
      <Link
        href="/search"
        prefetch
        className="rp-toolbar-btn"
        aria-label={t('toolbar.search', '搜索')}
        title={t('toolbar.search', '搜索')}
      >
        <IconSearch className="h-[1.0625rem] w-[1.0625rem]" />
      </Link>
      <span className="rp-toolbar-divider" aria-hidden />
      <LocaleToggle />
      <ColorSchemeToggle />
      <span className="rp-toolbar-divider" aria-hidden />
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        className="rp-toolbar-btn"
        aria-label={t('toolbar.github', 'GitHub')}
        title={t('toolbar.github', 'GitHub')}
      >
        <IconGithub className="h-[1.0625rem] w-[1.0625rem]" />
      </a>
      <span className="rp-toolbar-divider header-auth-divider" aria-hidden />
      <div className="header-auth">
        <Link href="/login" className="header-auth-link">
          {t('auth.login', '登录')}
        </Link>
        <Link href="/register" className="header-auth-link header-auth-link--primary">
          {t('auth.register', '注册')}
        </Link>
      </div>
    </div>
  );
}
