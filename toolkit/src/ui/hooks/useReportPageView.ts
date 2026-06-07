import { useEffect, useRef } from 'react';

import { themeApi } from '../../theme/api/api';

export interface UseReportPageViewOptions {
  /** Report on every render when URL changes; default uses current `window.location.href`. */
  url?: string;
  /** Skip localhost / 127.0.0.1 (default true). */
  skipLocalhost?: boolean;
  enabled?: boolean;
}

/**
 * POST a page view once per distinct URL (browser only). Pair with layout shell or `_app`.
 */
export function useReportPageView(options: UseReportPageViewOptions = {}): void {
  const { url, skipLocalhost = true, enabled = true } = options;
  const lastUrl = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    const target = url ?? window.location.href;
    if (skipLocalhost && /localhost|127\.0\.0\.1/.test(target)) return undefined;
    if (lastUrl.current === target) return undefined;
    lastUrl.current = target;

    themeApi.view
      .create({ body: { url: target } } as Parameters<typeof themeApi.view.create>[0])
      .catch((error) => {
        console.error('[reactpress] report page view failed', error);
      });

    return undefined;
  });
}
