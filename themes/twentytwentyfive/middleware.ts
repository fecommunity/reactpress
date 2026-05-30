import {
  buildDevPortRedirectUrl,
  shouldRedirectDevPortToNginx,
} from '@fecommunity/reactpress-toolkit/dev';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const visitorPort = parseInt(process.env.PORT || process.env.CLIENT_PORT || '3001', 10);
const localePrefix = /^\/(zh|en)(?=\/|$)/;

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const localeMatch = pathname.match(localePrefix);
  if (localeMatch) {
    const locale = localeMatch[1];
    const stripped = pathname.replace(localePrefix, '') || '/';
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    const response = NextResponse.redirect(url, 308);
    response.cookies.set('reactpress-locale', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
    return response;
  }

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
