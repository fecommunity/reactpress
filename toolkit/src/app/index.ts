/** Type declarations for `@fecommunity/reactpress-toolkit/app` JS factories. */
import type { ComponentType, ReactNode } from 'react';
import type { ThemeMods } from '../theme/extension/branding-mods';

export type CreateThemeApp = (manifest: { id: string }) => unknown;

export type CreateReactPressAppOptions = {
  Layout: ComponentType<{
    children?: ReactNode;
    needFooter?: boolean;
    hasBg?: boolean;
    needHeader?: boolean;
  }>;
  /** i18n root provider (e.g. next-intl NextIntlProvider). */
  IntlProvider: ComponentType<Record<string, unknown>>;
  buildAppearanceCss?: (mods: ThemeMods) => string;
  httpClientOptions?: Record<string, unknown>;
  wrapContent?: (
    content: ReactNode,
    runtime: {
      locale: string;
      isDark: boolean;
      colorPrimary?: string;
      themeMods: ThemeMods;
      colorMode: string;
    },
  ) => unknown;
  scrollToTopOnRouteChange?: boolean;
  transformBootstrap?: (
    bootstrap: Record<string, unknown>,
    ctx: { pathname?: string; asPath?: string },
  ) => Record<string, unknown>;
};

export type CreateReactPressApp = (
  manifest: { id: string; options?: unknown },
  options: CreateReactPressAppOptions,
) => unknown;

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const createThemeApp = require('./createThemeApp').createThemeApp as CreateThemeApp;
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const createReactPressApp = require('./createReactPressApp').createReactPressApp as CreateReactPressApp;
/** @deprecated Use `createReactPressApp`. */
export const createCatalogThemeApp = createReactPressApp;
