'use client';

import { siteNoticeDisplayLines, useSiteSetting } from '@fecommunity/reactpress-toolkit/theme';
import { useEffect, useRef, useState } from 'react';

import { BellIcon } from '@/lib/utils/icons';

const NOTICE_INTERVAL_MS = 4500;

function noticePlainText(html: string) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function NoticeContent({ html }: { html: string }) {
  const plain = noticePlainText(html);

  return (
    <div
      className="rp-notification-text"
      title={plain || undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function NoticeTicker({
  notices,
  activeIndex,
  canRotate,
  canAnimate,
}: {
  notices: string[];
  activeIndex: number;
  canRotate: boolean;
  canAnimate: boolean;
}) {
  const [leavingIndex, setLeavingIndex] = useState<number | null>(null);
  const prevIndexRef = useRef(activeIndex);

  useEffect(() => {
    if (!canAnimate || prevIndexRef.current === activeIndex) return undefined;

    setLeavingIndex(prevIndexRef.current);
    prevIndexRef.current = activeIndex;

    const timer = window.setTimeout(() => setLeavingIndex(null), 540);
    return () => window.clearTimeout(timer);
  }, [activeIndex, canAnimate]);

  useEffect(() => {
    prevIndexRef.current = 0;
    setLeavingIndex(null);
  }, [notices]);

  const content = notices[activeIndex] ?? notices[0];

  if (!canRotate) {
    return <NoticeContent html={content} />;
  }

  if (!canAnimate) {
    return <NoticeContent html={content} />;
  }

  return (
    <div className="rp-notification-ticker-viewport">
      {leavingIndex !== null ? (
        <div key={`leave-${leavingIndex}-${activeIndex}`} className="rp-notification-ticker-item is-leaving" aria-hidden>
          <NoticeContent html={notices[leavingIndex]} />
        </div>
      ) : null}
      <div key={`enter-${activeIndex}`} className="rp-notification-ticker-item is-entering">
        <NoticeContent html={content} />
      </div>
    </div>
  );
}

export default function SystemNotification() {
  const setting = useSiteSetting();
  const notices = siteNoticeDisplayLines(setting?.systemNoticeInfo);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [bellPulse, setBellPulse] = useState(false);
  const [phase, setPhase] = useState<'visible' | 'dismissing' | 'hidden'>('visible');
  const [reduceMotion, setReduceMotion] = useState(false);

  const canRotate = notices.length > 1;
  const canAnimate = canRotate && !reduceMotion;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [notices]);

  useEffect(() => {
    if (!canRotate || paused || phase !== 'visible') return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % notices.length);
      setBellPulse(true);
    }, NOTICE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [canRotate, paused, phase, notices.length]);

  useEffect(() => {
    if (!bellPulse) return undefined;
    const timer = window.setTimeout(() => setBellPulse(false), 560);
    return () => window.clearTimeout(timer);
  }, [bellPulse]);

  const handleDismiss = () => {
    setPhase('dismissing');
    window.setTimeout(() => setPhase('hidden'), 320);
  };

  if (!notices.length || phase === 'hidden') return null;

  return (
    <div
      className={`rp-notification-bar mt-4 flex items-center gap-3 overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--border-color)_70%,transparent)] bg-[color-mix(in_srgb,var(--bg-box)_92%,transparent)] px-4 py-3 text-sm text-[var(--main-text-color)] shadow-[var(--box-shadow)] backdrop-blur-sm ${
        phase === 'dismissing' ? 'is-dismissing' : ''
      }`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      role="status"
      aria-live="polite"
    >
      <span
        className={`rp-notification-icon shrink-0 text-[var(--primary-color)] ${bellPulse ? 'is-active' : ''}`}
        aria-hidden
      >
        <BellIcon size={16} />
      </span>

      <div className="min-w-0 flex-1 [&_a]:text-inherit [&_a]:no-underline [&_a:hover]:text-[var(--primary-color)]">
        <NoticeTicker
          notices={notices}
          activeIndex={activeIndex}
          canRotate={canRotate}
          canAnimate={canAnimate}
        />
      </div>

      <button
        type="button"
        aria-label="Close notification"
        className="rp-notification-close shrink-0 text-[var(--second-text-color)] hover:text-[var(--primary-color)]"
        onClick={handleDismiss}
      >
        ×
      </button>
    </div>
  );
}
