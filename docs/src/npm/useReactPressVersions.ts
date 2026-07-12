import { useEffect, useState } from 'react';

import {
  FALLBACK_REACTPRESS_VERSIONS,
  fetchReactPressVersions,
  type ReactPressDistTags,
} from './packageVersions';

export type ReactPressVersionsState = ReactPressDistTags & {
  isLoading: boolean;
  error: string | null;
};

export function useReactPressVersions(): ReactPressVersionsState {
  const [versions, setVersions] = useState<ReactPressDistTags>(FALLBACK_REACTPRESS_VERSIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchReactPressVersions()
      .then((distTags) => {
        if (!cancelled) {
          setVersions(distTags);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load npm versions');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    ...versions,
    isLoading,
    error,
  };
}
