'use client';

import { useState } from 'react';
import { useSiteMeta } from '@fecommunity/reactpress-toolkit/theme';
import { useThemeT } from '../hooks/useThemeT';
import { IconBell, IconClose } from './ui/icons';

/** Site announcement below the header — matches client alert bar. */
export default function SystemNotice() {
  const meta = useSiteMeta();
  const t = useThemeT();
  const siteName = meta.siteName || 'ReactPress';
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="system-notice" role="status">
      <span className="system-notice-icon" aria-hidden>
        <IconBell className="h-4 w-4" />
      </span>
      <p className="system-notice-text">
        {siteName} {t('notice.prefix', 'Built with')}{' '}
        <a href="https://github.com/fecommunity/reactpress" target="_blank" rel="noreferrer">
          ReactPress
        </a>
        {t('notice.suffix', '. Star us on GitHub!')}
      </p>
      <button
        type="button"
        className="system-notice-close"
        aria-label={t('notice.close', 'Dismiss notice')}
        onClick={() => setVisible(false)}
      >
        <IconClose className="h-4 w-4" />
      </button>
    </div>
  );
}
