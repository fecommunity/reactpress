import { useEffect } from 'react';

export interface RouteProgressProps {
  /** Delay before showing the bar (ms). */
  delay?: number;
}

/**
 * Next.js route transition progress bar.
 * Requires `nprogress` as a peer dependency in the theme package.
 */
export function RouteProgress({ delay = 100 }: RouteProgressProps) {
  useEffect(() => {
    let nprogress: { start: () => void; done: () => void } | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      nprogress = require('nprogress');
    } catch {
      return undefined;
    }

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const Router = require('next/router').default;

    const start = () => {
      timeout = setTimeout(() => nprogress?.start(), delay);
    };

    const done = () => {
      if (timeout) clearTimeout(timeout);
      nprogress?.done();
    };

    Router.events.on('routeChangeStart', start);
    Router.events.on('routeChangeComplete', done);
    Router.events.on('routeChangeError', done);

    return () => {
      Router.events.off('routeChangeStart', start);
      Router.events.off('routeChangeComplete', done);
      Router.events.off('routeChangeError', done);
      nprogress?.done();
    };
  }, [delay]);

  return null;
}
