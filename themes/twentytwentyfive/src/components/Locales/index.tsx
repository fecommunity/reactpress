import { Dropdown, Menu } from 'antd';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import React, { useContext, useEffect } from 'react';

import { GlobalContext } from '@/context/global';

export function Locales() {
  const t = useTranslations();
  const { locale: defaultLocale } = useRouter();
  const { i18n, locales = [], changeLocale } = useContext(GlobalContext);

  const menu = (
    <Menu>
      {locales.map((locale) => {
        return (
          <Menu.Item key={locale} onClick={() => changeLocale(locale)}>
            {t(locale)}
          </Menu.Item>
        );
      })}
    </Menu>
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const local = defaultLocale || window.localStorage.getItem('locale');
    if (local && i18n[local]) {
      changeLocale(local);
    }
  }, [i18n, defaultLocale, changeLocale]);

  return (
    <Dropdown overlay={menu}>
      <div style={{ display: 'flex', alignItems: 'center', width: 24, height: 24, cursor: 'pointer' }}>
        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em">
          <path
            d="M547.797333 638.208l-104.405333-103.168 1.237333-1.28a720.170667 720.170667 0 0 0 152.490667-268.373333h120.448V183.082667h-287.744V100.906667H347.605333v82.218666H59.818667V265.386667h459.178666a648.234667 648.234667 0 0 1-130.304 219.946666 643.242667 643.242667 0 0 1-94.976-137.728H211.541333a722.048 722.048 0 0 0 122.453334 187.434667l-209.194667 206.378667 58.368 58.368 205.525333-205.525334 127.872 127.829334 31.232-83.84m231.424-208.426667h-82.218666l-184.96 493.312h82.218666l46.037334-123.306667h195.242666l46.464 123.306667h82.218667l-185.002667-493.312m-107.690666 287.744l66.56-178.005333 66.602666 178.005333z"
            fill="currentColor"
          ></path>
        </svg>
      </div>
    </Dropdown>
  );
}
