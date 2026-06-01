import { useEffect } from 'react';

/** Loads code-highlight and image-viewer CSS only on content-heavy routes. */
export function ContentStylesLoader() {
  useEffect(() => {
    void import('highlight.js/styles/atom-one-dark.css');
    void import('viewerjs/dist/viewer.css');
  }, []);
  return null;
}
