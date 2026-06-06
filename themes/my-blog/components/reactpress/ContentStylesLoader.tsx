'use client';

import 'highlight.js/styles/atom-one-dark.css';
import 'viewerjs/dist/viewer.css';

/** Ensures article content styles (hljs, viewerjs) are bundled on reading routes. */
export function ContentStylesLoader() {
  return null;
}
