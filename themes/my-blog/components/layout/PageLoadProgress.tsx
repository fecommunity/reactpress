'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useHeaderTop } from '@/lib/utils/headerPosition';

const MIN_PROGRESS = 0.08;
const TRICKLE_INC = 0.012;
const TRICKLE_MS = 180;
const HIDE_DELAY_MS = 280;

function clearLoadingMarker() {
  document.documentElement.removeAttribute('data-rp-loading');
}

function isSameRoute(pathname: string, href: string) {
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return true;
    const current = `${pathname}${window.location.search}`;
    const next = `${url.pathname}${url.search}`;
    return current === next;
  } catch {
    return true;
  }
}

function PageLoadProgressInner() {
  const headerTop = useHeaderTop();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const progressRef = useRef(0);
  const trickleTimerRef = useRef<ReturnType<typeof setInterval>>();
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const initialLoadDoneRef = useRef(false);
  const navigatingRef = useRef(false);
  const controlsRef = useRef<{ start: () => void; done: () => void } | null>(null);

  controlsRef.current = {
    start() {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = undefined;
      }
      progressRef.current = MIN_PROGRESS;
      setProgress(MIN_PROGRESS);
      setVisible(true);

      if (trickleTimerRef.current) {
        clearInterval(trickleTimerRef.current);
      }
      trickleTimerRef.current = setInterval(() => {
        const current = progressRef.current;
        if (current >= 0.92) return;
        const next = current + TRICKLE_INC * (1 - current);
        progressRef.current = next;
        setProgress(next);
      }, TRICKLE_MS);
    },
    done() {
      if (trickleTimerRef.current) {
        clearInterval(trickleTimerRef.current);
        trickleTimerRef.current = undefined;
      }
      progressRef.current = 1;
      setProgress(1);
      clearLoadingMarker();
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
        progressRef.current = 0;
        setProgress(0);
      }, HIDE_DELAY_MS);
    },
  };

  useLayoutEffect(() => {
    setMounted(true);
    clearLoadingMarker();

    if (document.readyState === 'complete') {
      initialLoadDoneRef.current = true;
      return;
    }

    controlsRef.current?.start();
    const onLoad = () => {
      initialLoadDoneRef.current = true;
      controlsRef.current?.done();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
    if (!mounted || !initialLoadDoneRef.current || !navigatingRef.current) return;
    navigatingRef.current = false;
    controlsRef.current?.done();
  }, [mounted, pathname, searchParams]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest('a');
      if (!anchor) return;
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      if (isSameRoute(pathname, href)) return;

      navigatingRef.current = true;
      controlsRef.current?.start();
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [pathname]);

  useEffect(
    () => () => {
      if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    },
    [],
  );

  if (!mounted || !visible) return null;

  const percent = Math.round(progress * 100);

  return createPortal(
    <div
      className="rp-page-load-progress"
      style={{ top: headerTop }}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page load progress"
    >
      <div className="rp-page-load-progress__track">
        <div className="rp-page-load-progress__bar" style={{ width: `${percent}%` }} />
      </div>
    </div>,
    document.documentElement,
  );
}

export default function PageLoadProgress() {
  return (
    <Suspense fallback={null}>
      <PageLoadProgressInner />
    </Suspense>
  );
}
