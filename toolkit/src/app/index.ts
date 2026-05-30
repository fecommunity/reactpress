/** Type declarations for `@fecommunity/reactpress-toolkit/app` JS factories. */
export type CreateThemeApp = (manifest: { id: string }) => unknown;

export type CreateReactPressAppOptions = {
  Layout: (props: {
    children?: unknown;
    needFooter?: boolean;
    hasBg?: boolean;
    needHeader?: boolean;
  }) => unknown;
  IntlProvider: (props: {
    locale: string;
    messages: Record<string, unknown>;
    children?: unknown;
  }) => unknown;
  buildAppearanceCss?: (mods: Record<string, unknown>) => string;
  httpClientOptions?: Record<string, unknown>;
  wrapContent?: (
    content: unknown,
    runtime: {
      locale: string;
      isDark: boolean;
      colorPrimary?: string;
      themeMods: Record<string, unknown>;
      colorMode: string;
    },
  ) => unknown;
  scrollToTopOnRouteChange?: boolean;
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
