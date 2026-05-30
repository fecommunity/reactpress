import type { ReactElement, ReactNode } from 'react';
import { useEffect } from 'react';

export interface ImageViewerProps {
  /** CSS selector for the container whose images should be zoomable. */
  containerSelector: string;
  children?: ReactNode;
}

/** Wrap content and enable viewerjs image zoom (peer dep in theme). */
export function ImageViewer({ containerSelector, children }: ImageViewerProps): ReactElement {
  useEffect(() => {
    type ViewerCtor = new (el: Element, options: { inline: boolean }) => {
      update: () => void;
      destroy: () => void;
    };

    let Viewer: ViewerCtor | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('viewerjs');
      Viewer = (mod?.default ?? mod) as ViewerCtor;
      if (typeof Viewer !== 'function') {
        return undefined;
      }
    } catch {
      return undefined;
    }

    const el = document.querySelector(containerSelector);
    if (!el) return undefined;

    const viewer = new Viewer(el, { inline: false });
    const io = new MutationObserver(() => viewer.update());
    io.observe(el, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      viewer.destroy();
    };
  }, [containerSelector]);

  return <>{children}</>;
}
