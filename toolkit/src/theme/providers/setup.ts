import { clearThemeSession } from '../visitor/authSession';
import type { CreateThemeAxiosClientOptions } from '../api/httpClient';
import { createThemeAxiosClient } from '../api/httpClient';
import { createThemeProviders } from './index';

export type CreateThemeHttpStackOptions = CreateThemeAxiosClientOptions & {
  onError?: (message: string) => void;
  onUnauthorized?: () => void;
};

/**
 * One-call HTTP client + REST providers for theme pages.
 * Mirrors the stack used inside `createReactPressApp`, with optional toast hooks.
 */
export function createThemeHttpStack(options: CreateThemeHttpStackOptions = {}) {
  const { onError, onUnauthorized, ...httpOptions } = options;

  const httpProvider = createThemeAxiosClient({
    ...httpOptions,
    onError,
    onUnauthorized:
      onUnauthorized ??
      (() => {
        clearThemeSession();
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }),
  });

  const providers = createThemeProviders(httpProvider);

  return {
    httpProvider,
    ...providers,
  };
}
