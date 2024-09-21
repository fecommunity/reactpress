import { useEffect } from 'react';
import Viewer from 'viewerjs';

export const ImageViewer = ({ containerSelector, children }) => {
  useEffect(() => {
    const el = document.querySelector(containerSelector);
    if (!el) {
      return null;
    }
    const viewer = new Viewer(el, { inline: false });
    const io = new MutationObserver(() => {
      viewer.update();
    });
    io.observe(el, {
      childList: true,
      subtree: true,
    });

    return () => {
      io.disconnect();
      viewer.destroy();
    };
  }, [containerSelector]);

  return children;
};
