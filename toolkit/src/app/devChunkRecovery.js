const React = require('react');

/** Dev-only: recover from stale webpack chunks after on-demand page compilation. */
function DevChunkRecovery() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return undefined;

    const storageKey = '__reactpress_dev_chunk_recover';
    const maxAttempts = 2;

    const isChunkMismatch = (message) => {
      const msg = String(message || '');
      return (
        msg.includes("reading 'call'") ||
        msg.includes('ChunkLoadError') ||
        msg.includes('Loading chunk') ||
        msg.includes('__webpack_modules__') ||
        msg.includes('is not a function') ||
        msg.includes('/_next/undefined')
      );
    };

    const recover = () => {
      const attempts = Number(window.sessionStorage.getItem(storageKey) || 0);
      if (attempts >= maxAttempts) return;
      window.sessionStorage.setItem(storageKey, String(attempts + 1));
      window.location.reload();
    };

    const onError = (event) => {
      const msg = event?.message || event?.reason?.message || event?.reason || '';
      if (!isChunkMismatch(msg)) return;
      if (typeof event.preventDefault === 'function') event.preventDefault();
      recover();
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onError);

    const clearRecoveries = () => window.sessionStorage.removeItem(storageKey);
    window.addEventListener('load', clearRecoveries);

    let routerCleanup = () => {};
    try {
      const Router = require('next/router').default;
      if (Router?.events?.on) {
        const onRouteError = (err) => {
          if (err?.cancelled) return;
          if (isChunkMismatch(err?.message)) recover();
        };
        Router.events.on('routeChangeComplete', clearRecoveries);
        Router.events.on('routeChangeError', onRouteError);
        routerCleanup = () => {
          Router.events.off('routeChangeComplete', clearRecoveries);
          Router.events.off('routeChangeError', onRouteError);
        };
      }
    } catch {
      // App Router themes rely on window error listeners only.
    }

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onError);
      window.removeEventListener('load', clearRecoveries);
      routerCleanup();
    };
  }, []);

  return null;
}

module.exports = { DevChunkRecovery };
