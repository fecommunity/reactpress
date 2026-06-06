'use client';

import { useEffect, useState } from 'react';

export const HEADER_BAR_SELECTOR = '.rp-header-bar';

export function measureHeaderTop(): number {
  const header = document.querySelector(HEADER_BAR_SELECTOR);
  if (!header) return 0;
  const { top } = header.getBoundingClientRect();
  // Header visible: align with its top edge. Header hidden: stay at viewport top.
  return Math.max(0, top);
}

export function useHeaderTop() {
  const [top, setTop] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setTop(measureHeaderTop());
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    const header = document.querySelector(HEADER_BAR_SELECTOR);
    header?.addEventListener('transitionend', onScroll);

    const onHeaderState = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.id !== 'header-state') return;
      onScroll();
    };
    window.addEventListener('message', onHeaderState);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      header?.removeEventListener('transitionend', onScroll);
      window.removeEventListener('message', onHeaderState);
    };
  }, []);

  return top;
}
