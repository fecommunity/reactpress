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

import { SearchOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import cls from 'classnames';
import Link from 'next/link';
import { default as Router, useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import React, { useContext, useEffect, useMemo } from 'react';

import { Locales } from '@/components/Locales';
import { Search } from '@/components/Search';
import { Theme } from '@/components/Theme';
import { UserInfo } from '@/components/UserInfo';
import { SiteCatalogContext as GlobalContext } from '@fecommunity/reactpress-toolkit/theme';
import { useToggle } from '@fecommunity/reactpress-toolkit/theme';
import { getDocumentScrollTop, getFirstLevelRoute, getIconByName } from '@/utils';

import { GitHub } from '../AboutUs';
import style from './index.module.scss';
import { renderHeaderLogo } from './renderHeaderLogo';

interface HeaderProps {
  setting: ISetting;
  tags: ITag[];
  pages: Array<IPage & { label?: string }>;
  hasBg?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ setting, tags, pages, hasBg = false }) => {
  const t = useTranslations();
  const router = useRouter();
  const { asPath } = router;
  const { locales = [], siteConfig } = useContext(GlobalContext);
  const navLinks = siteConfig?.header?.navLinks ?? [];
  const [affix, setAffix] = useToggle(false);
  const [affixVisible, setAffixVisible] = useToggle(false);
  const [visible, setVisible] = useToggle(false);
  const [showSearch, toggleSearch] = useToggle(false);
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

  // Generate menu items for navigation
  const menuItems = useMemo(() => {
    const navMenu = navLinks.map((nav) => {
      const Icon = getIconByName(nav.icon);
      const labelText = nav.label || (nav.locale ? t(nav.locale) : nav.path);
      return {
        label: (
          <Link href={nav.path} key={nav.path}>
            <a aria-label={nav.locale || nav.path}>
              <span>{labelText}</span>
            </a>
          </Link>
        ),
        key: nav.path,
        icon: Icon ? <Icon /> : null,
      };
    });

    const pageMenu = pages.map((menu, index) => {
      const Icon = getIconByName(menu.path);
      return {
        key: `${index}-${menu.label}`,
        label: (
          <Link href={'/page/[id]'} as={`/page/${menu.path}`} scroll={false} key={`${index}-${menu.label}`}>
            <a aria-label={menu.name}>{t(menu.path) || menu.name}</a>
          </Link>
        ),
        icon: Icon ? <Icon /> : null
      }
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
              <a aria-label="home">{renderHeaderLogo({ systemLogo: setting.systemLogo })}</a>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div
            className={cls(style.mobileTrigger, visible ? style.active : false)}
            onClick={() => setVisible(!visible)}
            role="button"
            tabIndex={0}
            aria-label="Toggle mobile menu"
          >
            <div className={style.stick}></div>
            <div className={style.stick}></div>
            <div className={style.stick}></div>
          </div>

          {/* Navigation Menu */}
          <div className={style.menuWrapper}>
            <Menu
              rootClassName={style.menu}
              selectedKeys={[mainPath]}
              items={menuItems}
              mode="horizontal"
              className={cls(visible ? style.active : false, style.menu)}
            />
          </div>

          {/* Right Side Tools */}
          <nav className={cls(visible ? style.active : false)}>
            <ul>
              <li className={style.toolWrapper}>
                <SearchOutlined
                  style={{ cursor: 'pointer' }}
                  onClick={toggleSearch}
                  aria-label="Search"
                />
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
            <Search tags={tags} visible={showSearch} onClose={toggleSearch} />
          </nav>
        </div>
      </div>
    </header>
  );
};
