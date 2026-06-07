import { useRouter } from 'next/router';

/**
 * Resolve a dynamic route param during ISR fallback.
 * Prefers the value from `getStaticProps`, then falls back to `router.query`.
 */
export function useRouteParam(propValue: string | undefined, paramName: string): string {
  const router = useRouter();
  if (propValue) return propValue;
  const queryValue = router.query[paramName];
  return typeof queryValue === 'string' ? queryValue : '';
}
