'use client';

import ArticleActionButton, { type ArticleActionVariant } from '@/components/widgets/ArticleActionButton';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ShareWidgetProps {
  variant?: ArticleActionVariant;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}

export default function ShareWidget({ variant = 'floating' }: ShareWidgetProps) {
  const { t } = useLocale();
  const [toast, setToast] = useState('');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<number | null>(null);
  const lockingRef = useRef(false);

  const label = t('share');

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const handleShare = useCallback(async () => {
    if (lockingRef.current) return;

    lockingRef.current = true;
    setBusy(true);

    const ok = await copyToClipboard(window.location.href);
    if (!ok) {
      lockingRef.current = false;
      setBusy(false);
      return;
    }

    setCopied(true);
    setToast(t('shareLinkCopied'));
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      setToast('');
      setCopied(false);
      setBusy(false);
      lockingRef.current = false;
      timerRef.current = null;
    }, 2000);
  }, [clearTimer, t]);

  return (
    <>
      <ArticleActionButton
        active={copied}
        disabled={busy}
        label={label}
        onClick={handleShare}
        variant={variant}
        activeClassName="is-shared"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.59 13.51 6.83 3.98" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15.41 6.51l-6.82 3.98" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ArticleActionButton>
      {toast && mounted
        ? createPortal(
            <div className="rp-share-toast" role="status" aria-live="polite">
              {toast}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
