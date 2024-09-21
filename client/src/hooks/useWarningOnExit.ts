import Router from 'next/router';
import { useEffect } from 'react';

export const useWarningOnExit = (shouldWarn: boolean, warn?: () => boolean) => {
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
          // eslint-disable-next-line no-throw-literal
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
        } else {
          isWarned = false;
          window.history.pushState(null, '', url);
          Router.replace(Router, Router.asPath, { shallow: true });
          return false;
        }
      }
      return true;
    });

    return () => {
      Router.events.off('routeChangeStart', routeChangeStart);
      window.removeEventListener('beforeunload', beforeUnload);
      Router.beforePopState(() => {
        return true;
      });
    };
  }, [warn, shouldWarn]);
};
