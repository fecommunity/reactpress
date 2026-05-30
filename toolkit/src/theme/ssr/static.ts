import type { GetStaticPathsResult } from 'next';

import { THEME_ISR_REVALIDATE_SECONDS } from './fetch';

/** WordPress-style on-demand ISR paths (`fallback: true`). */
export const themeOnDemandPaths: GetStaticPathsResult = {
  paths: [],
  fallback: true,
};

export function themeNotFound() {
  return { notFound: true as const };
}

export function themeStaticNotFound(revalidate = THEME_ISR_REVALIDATE_SECONDS) {
  return { notFound: true as const, revalidate };
}
