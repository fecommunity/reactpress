import { useCallback, useState } from 'react';

/** Force a function component re-render without changing state props. */
export function useForceUpdate(): () => void {
  const [, update] = useState(0);

  return useCallback(() => {
    update((v) => v + 1);
  }, []);
}
