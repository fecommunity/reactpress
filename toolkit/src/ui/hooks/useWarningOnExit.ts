import Router from 'next/router';
import { useEffect } from 'react';

/**
 * Confirm before leaving the page (browser refresh/close or Next.js route change).
 * `warn` should return `true` to allow navigation, `false` to cancel.
 */
export function useWarningOnExit(shouldWarn: boolean, warn: () => boolean = () => true): void {
  useEffect(() => {
    let isWarned = false;

    const routeChangeStart = (url: string) => {
      if (Router.asPath !== url && shouldWarn && !isWarned) {
        isWarned = true;
        if (warn()) {
          Router.push(url);
        } else {
          isWarned = false;
          Router.events.emit('routeChangeError');
          Router.replace(Router, Router.asPath, { shallow: true });
          throw 'Abort route change. Please ignore this error.';
        }
      }
    };

    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldWarn && !isWarned) {
        const event = e || window.event;
        event.returnValue = 'Abort route change. Please ignore this error.';
        return 'Abort route change. Please ignore this error.';
      }
      return null;
    };

    Router.events.on('routeChangeStart', routeChangeStart);
    window.addEventListener('beforeunload', beforeUnload);
    Router.beforePopState(({ url }) => {
      if (Router.asPath !== url && shouldWarn && !isWarned) {
        isWarned = true;
        if (warn()) {
          return true;
        }
        isWarned = false;
        window.history.pushState(null, '', url);
        Router.replace(Router, Router.asPath, { shallow: true });
        return false;
      }
      return true;
    });

    return () => {
      Router.events.off('routeChangeStart', routeChangeStart);
      window.removeEventListener('beforeunload', beforeUnload);
      Router.beforePopState(() => true);
    };
  }, [warn, shouldWarn]);
}
