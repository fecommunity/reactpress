import { useEffect } from 'react';

/** Loads third-party content CSS only on article/knowledge/page routes. */
export function ContentStylesLoader() {
  useEffect(() => {
    void import('highlight.js/styles/atom-one-dark.css');
    void import('viewerjs/dist/viewer.css');
  }, []);
  return null;
}
