import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Wrap an async function and expose a debounced `loading` flag (avoids flicker on fast requests).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAsyncLoading<A extends (...args: any[]) => Promise<any>>(
  action: A,
  wait = 200,
  initialLoading = false,
): [A, boolean] {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(initialLoading);

  const actionWithPending = useCallback(
    (...args: Parameters<A>) => {
      setPending(true);
      const promise = action(...args);
      promise.then(
        () => setPending(false),
        () => setPending(false),
      );
      return promise;
    },
    [action],
  );

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setLoading(pending);
    }, wait);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [wait, pending]);

  return [actionWithPending as A, loading];
}
