'use client';

import { siteNoticeDisplayLines, useSiteSetting } from '@fecommunity/reactpress-toolkit/theme';
import { useEffect, useState } from 'react';

import { BellIcon } from '@/src/utils/icons';

export default function SystemNotification() {
  const setting = useSiteSetting();
  const notices = siteNoticeDisplayLines(setting?.systemNoticeInfo);
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!notices?.length || notices.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % notices.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [notices]);

  if (!notices?.length || dismissed) return null;

  return (
    <div className="mt-4 flex items-start gap-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-box)] px-4 py-3 text-sm text-[var(--main-text-color)] shadow-[var(--box-shadow)]">
      <span className="mt-0.5 text-[var(--primary-color)]">
        <BellIcon size={16} />
      </span>
      <div
        className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap [&_a]:text-inherit [&_a]:no-underline [&_a:hover]:text-[var(--primary-color)]"
        dangerouslySetInnerHTML={{ __html: notices[index] ?? notices[0] }}
      />
      <button
        type="button"
        aria-label="Close notification"
        className="rp-notification-close shrink-0 text-[var(--second-text-color)] hover:text-[var(--primary-color)]"
        onClick={() => setDismissed(true)}
      >
        ×
      </button>
    </div>
  );
}
