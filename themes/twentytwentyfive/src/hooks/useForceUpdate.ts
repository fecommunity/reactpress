import { useCallback, useState } from 'react';

export function useForceUpdate() {
  const [, update] = useState(-1);

  const forceUpdate = useCallback(() => {
    update((v) => v + 1);
  }, []);

  return forceUpdate;
}
