'use client';

import TagCloudEngine from '@/lib/utils/tagCloud';
import { type ReactNode, useLayoutEffect, useRef } from 'react';

interface TagCloudProps {
  children: ReactNode;
  className?: string;
  onReadyChange?: (ready: boolean) => void;
  'aria-hidden'?: boolean;
}

function canInitialize(el: HTMLDivElement) {
  const anchors = el.getElementsByTagName('a');
  if (!anchors.length || el.offsetWidth === 0 || el.offsetHeight === 0) return false;

  for (let i = 0; i < anchors.length; i++) {
    if (anchors[i].offsetWidth > 0) return true;
  }

  return false;
}

export default function TagCloud({ children, className = '', onReadyChange, ...rest }: TagCloudProps) {
  const ref = useRef<HTMLDivElement>(null);
  const engineRef = useRef<TagCloudEngine | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (!engineRef.current) {
      engineRef.current = new TagCloudEngine();
    }

    const engine = engineRef.current;
    let cancelled = false;
    let observer: ResizeObserver | null = null;

    const markReady = (ready: boolean) => {
      onReadyChange?.(ready);
    };

    const tryInit = () => {
      if (cancelled || !ref.current) return true;
      if (!canInitialize(ref.current)) return false;

      ref.current.classList.remove('is-ready');
      markReady(false);
      engine.init(ref.current);
      ref.current.classList.add('is-ready');
      markReady(true);
      return true;
    };

    el.classList.remove('is-ready');
    markReady(false);

    if (!tryInit()) {
      observer = new ResizeObserver(() => {
        if (tryInit() && observer) {
          observer.disconnect();
          observer = null;
        }
      });
      observer.observe(el);

      if (typeof document !== 'undefined' && document.fonts?.ready) {
        void document.fonts.ready.then(() => {
          if (!cancelled) tryInit();
        });
      }
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      engine.destroy();
      el.classList.remove('is-ready');
      markReady(false);
    };
  }, [children, onReadyChange]);

  return (
    <div ref={ref} className={`rp-tag-cloud ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
