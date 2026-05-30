import { buildDevPortRedirectUrl, shouldRedirectDevPortToNginx } from './portRedirect';

const VITE_DEV_SKIP_PREFIXES = ['/@vite', '/@fs', '/@id', '/node_modules'];

type DevServer = {
  middlewares: {
    use: (handler: (req: DevRequest, res: DevResponse, next: () => void) => void) => void;
  };
};

type DevRequest = {
  url?: string;
  method?: string;
  headers: {
    host?: string;
    accept?: string;
  };
};

type DevResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: () => void;
};

function createRedirectMiddleware(port: number) {
  return (req: DevRequest, res: DevResponse, next: () => void) => {
    const url = req.url || '/';
    const pathname = url.split('?')[0] || '/';
    const search = url.includes('?') ? url.slice(url.indexOf('?')) : '';

    if (
      !shouldRedirectDevPortToNginx({
        host: req.headers.host,
        method: req.method,
        accept: req.headers.accept,
        directPort: port,
        pathname,
        skipPathPrefixes: VITE_DEV_SKIP_PREFIXES,
      })
    ) {
      next();
      return;
    }

    const target = buildDevPortRedirectUrl({
      directPort: port,
      pathname,
      search,
    });
    res.statusCode = 302;
    res.setHeader('Location', target);
    res.end();
  };
}

/** Redirect direct :3000 browser hits to nginx entry when REACTPRESS_NGINX_ENTRY_URL is set. */
export function devPortRedirectPlugin(port: number) {
  return {
    name: 'reactpress-dev-port-redirect',
    configureServer(server: DevServer) {
      server.middlewares.use(createRedirectMiddleware(port));
    },
  };
}
