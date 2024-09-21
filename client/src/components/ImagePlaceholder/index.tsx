import { useEffect } from 'react';

export const ImagePlaceholder = ({ children }) => {
  useEffect(() => {
    const listener = (e) => {
      if (e.target.tagName !== 'IMG') {
        return;
      }
      e.target.style.backgroundImage = 'none';
    };
    document.body.addEventListener('load', listener, true);

    return () => {
      document.body.removeEventListener('load', listener, true);
    };
  }, []);

  return children || null;
};
