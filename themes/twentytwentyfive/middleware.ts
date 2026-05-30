import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  buildDevPortRedirectUrl,
  shouldRedirectDevPortToNginx,
} from '@fecommunity/reactpress-toolkit/dev';

const visitorPort = parseInt(process.env.PORT || process.env.CLIENT_PORT || '3001', 10);

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    !shouldRedirectDevPortToNginx({
      host: request.headers.get('host'),
      method: request.method,
      accept: request.headers.get('accept'),
      directPort: visitorPort,
      pathname,
      skipPathPrefixes: ['/_next'],
    })
  ) {
    return NextResponse.next();
  }

  const target = buildDevPortRedirectUrl({
    directPort: visitorPort,
    pathname,
    search,
  });

  return NextResponse.redirect(target, 302);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
