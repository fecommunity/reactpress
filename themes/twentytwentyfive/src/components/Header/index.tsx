/**
 * Header Component
 * 
 * This component represents the main navigation header of the application.
 * It includes:
 * - Logo
 * - Navigation menu
 * - Search functionality
 * - Theme switcher
 * - Language selector
 * - User info
 * - GitHub link
 * 
 * Features:
 * - Responsive design with mobile menu
 * - Sticky header with scroll behavior
 * - Dynamic menu items based on pages
 * - Search functionality
 */

import cls from 'classnames';
import Link from 'next/link';
import { default as Router, useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import React, { useContext, useEffect, useMemo } from 'react';

import { Locales } from '@/components/Locales';
import { Theme } from '@/components/Theme';
import { UserInfo } from '@/components/UserInfo';
import { SiteCatalogContext as GlobalContext } from '@fecommunity/reactpress-toolkit/theme';
import { useToggle } from '@fecommunity/reactpress-toolkit/theme';
import { getDocumentScrollTop, getFirstLevelRoute, getIconByName } from '@/utils';

import { GitHub } from '../AboutUs';
import { HeaderSearch } from './HeaderSearch';
import style from './index.module.scss';
import { renderHeaderLogo } from './renderHeaderLogo';

interface HeaderProps {
  setting: ISetting;
  pages: Array<IPage & { label?: string }>;
  hasBg?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ setting, pages, hasBg = false }) => {
  const t = useTranslations();
  const router = useRouter();
  const { asPath } = router;
  const { locales = [], siteConfig } = useContext(GlobalContext);
  const navLinks = siteConfig?.header?.navLinks ?? [];
  const [affix, setAffix] = useToggle(false);
  const [affixVisible, setAffixVisible] = useToggle(false);
  const [visible, setVisible] = useToggle(false);
  const mainPath = getFirstLevelRoute(asPath, locales);

  // Handle route change to close mobile menu
  useEffect(() => {
    const close = () => {
      if (visible) {
        setVisible(false);
      }
    };

    Router.events.on('routeChangeStart', close);

    return () => {
      Router.events.off('routeChangeStart', close);
    };
  }, [setVisible, visible]);

  // Handle scroll behavior for sticky header
  useEffect(() => {
    let beforeY = 0;
    let y = 0;
    const handler = () => {
      y = getDocumentScrollTop();
      setAffix(y > 0);
      setAffixVisible(beforeY >= y);
      setTimeout(() => {
        beforeY = y;
      }, 0);
    };
    document.addEventListener('scroll', handler);

    return () => {
      document.removeEventListener('scroll', handler);
    };
  }, [setAffix, setAffixVisible]);

  // Generate navigation links
  const navItems = useMemo(() => {
    const navMenu = navLinks.map((nav) => {
      const Icon = getIconByName(nav.icon);
      const labelText = nav.label || (nav.locale ? t(nav.locale) : nav.path);
      return {
        key: nav.path,
        href: nav.path,
        as: undefined as string | undefined,
        label: labelText,
        icon: Icon ? <Icon /> : null,
      };
    });

    const pageMenu = pages.map((menu, index) => {
      const Icon = getIconByName(menu.path);
      return {
        key: `${index}-${menu.label}`,
        href: '/page/[id]',
        as: `/page/${menu.path}` as string | undefined,
        label: t(menu.path) || menu.name,
        icon: Icon ? <Icon /> : null,
      };
    });
    return navMenu.concat(pageMenu);
  }, [navLinks, pages, t]);

  // Notify other components about header state
  useEffect(() => {
    window.postMessage(
      {
        id: 'header-state',
        isFixedVisible: affix && affixVisible,
        height: '64px',
        isFxied: affix,
      },
      location.origin
    );
  }, [affix, affixVisible]);

  return (
    <header className={cls(style.header, hasBg && !visible ? style.transparent : false)}>
      <div
        className={cls(
          style.wrapper,
          affix ? style.isFixed : false,
          affixVisible ? style.visible : false,
          hasBg && !visible ? style.transparent : false
        )}
      >
        <div className={cls('container')}>
          {/* Logo Section */}
          <div className={style.logo}>
            <Link href="/" scroll={false}>
              <a aria-label={setting.systemTitle || 'Home'}>
                {renderHeaderLogo({ systemLogo: setting.systemLogo })}
              </a>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div
            className={cls(style.mobileTrigger, visible ? style.active : false)}
            onClick={() => setVisible(!visible)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setVisible(!visible);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Toggle mobile menu"
            aria-expanded={visible}
          >
            <div className={style.stick}></div>
            <div className={style.stick}></div>
            <div className={style.stick}></div>
          </div>

          {/* Navigation + Tools */}
          <nav
            className={cls(style.toolbar, visible ? style.active : false)}
            aria-label={setting.systemTitle || 'Navigation'}
          >
            <ul className={style.toolbarList}>
              {navItems.map((item) => {
                const isActive = item.as ? asPath === item.as : mainPath === item.key || asPath === item.href;
                return (
                  <li key={item.key} className={style.navItem}>
                    <Link href={item.href} as={item.as} scroll={false}>
                      <a className={isActive ? style.active : undefined}>
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    </Link>
                  </li>
                );
              })}
              <li className={style.toolWrapperSearch}>
                <HeaderSearch />
              </li>
              <li className={style.toolWrapper}>
                <Theme />
              </li>
              <li className={style.toolWrapper}>
                <Locales />
              </li>
              {setting.aboutUsGithubUrl?.trim() ? (
                <li className={style.toolWrapper}>
                  <GitHub url={setting.aboutUsGithubUrl} />
                </li>
              ) : null}
              <li className={style.toolWrapper}>
                <UserInfo />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};
