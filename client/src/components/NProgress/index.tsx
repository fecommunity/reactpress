import { useRouter } from 'next/router';
import * as NP from 'nprogress';
import { useEffect } from 'react';

export function NProgress() {
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const start = () => {
      timeout = setTimeout(NP.start, 100);
    };

    const done = () => {
      clearTimeout(timeout);
      NP.done();
    };

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', done);
    router.events.on('routeChangeError', done);

    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', done);
      NP.done();
    };
  }, []);

  return null;
}
