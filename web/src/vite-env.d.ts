/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly SSR: boolean;
  readonly VITE_ENABLE_MOCK?: string;
  readonly VITE_AUTH_MODE?: string;
  readonly VITE_DEV_API_PROXY_TARGET?: string;
  readonly VITE_ADMIN_BASE?: string;
  readonly VITE_API_BASE?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_REACTPRESS_DOCS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.css" {
  const content: string;
  export default content;
}

declare module "*?url" {
  const url: string;
  export default url;
}
