import { THEME_ISR_REVALIDATE_SECONDS } from './fetch';

/** WordPress-style on-demand ISR paths (`fallback: true`). */
export const themeOnDemandPaths = {
  paths: [] as const,
  fallback: true as const,
};

export function themeNotFound() {
  return { notFound: true as const };
}

export function themeStaticNotFound(revalidate = THEME_ISR_REVALIDATE_SECONDS) {
  return { notFound: true as const, revalidate };
}
