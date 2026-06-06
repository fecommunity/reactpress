'use client';

import type { ReactNode } from 'react';

type ReadingChromeMode = 'side' | 'mobile' | 'toc' | 'all';

interface ArticleReadingChromeProps {
  actions: ReactNode;
  mobileActions: ReactNode;
  showToc: boolean;
  tocExpanded: boolean;
  onToggleToc: () => void;
  tocPanel: ReactNode;
  collapseLabel: string;
  expandLabel: string;
  tocLabel: string;
  mode?: ReadingChromeMode;
}

function TocIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 6h16M4 12h10M4 18h14" strokeLinecap="round" />
    </svg>
  );
}

export default function ArticleReadingChrome({
  actions,
  mobileActions,
  showToc,
  tocExpanded,
  onToggleToc,
  tocPanel,
  collapseLabel,
  expandLabel,
  tocLabel,
  mode = 'all',
}: ArticleReadingChromeProps) {
  const showSide = mode === 'side' || mode === 'all';
  const showMobile = mode === 'mobile' || mode === 'all';
  const showTocDrawer = mode === 'toc' || mode === 'all';

  return (
    <>
      {showToc && showTocDrawer ? (
        <>
          <button
            type="button"
            className={`rp-toc-toggle${tocExpanded ? ' is-open' : ''}`}
            aria-label={tocExpanded ? collapseLabel : expandLabel}
            aria-expanded={tocExpanded}
            aria-controls="rp-toc-fixed-drawer"
            onClick={onToggleToc}
          >
            <TocIcon />
          </button>
          <aside
            id="rp-toc-fixed-drawer"
            className={`rp-toc-fixed-drawer${tocExpanded ? '' : ' is-collapsed'}`}
            aria-hidden={!tocExpanded}
          >
            <div className="rp-toc-fixed-drawer__inner">{tocPanel}</div>
          </aside>
        </>
      ) : null}

      {showSide && actions ? (
        <nav className="rp-reading-dock rp-reading-dock--side" aria-label="Reading actions">
          <div className="rp-reading-dock__actions">{actions}</div>
        </nav>
      ) : null}

      {showMobile ? (
        <nav className="rp-reading-dock rp-reading-dock--bottom" aria-label="Reading actions">
          <div className="rp-reading-dock__inner rp-reading-dock__inner--bottom">
            {showToc ? (
              <button
                type="button"
                className={`rp-reading-dock__toc rp-reading-dock__toc--mobile${tocExpanded ? ' is-open' : ''}`}
                aria-label={tocExpanded ? collapseLabel : expandLabel}
                aria-expanded={tocExpanded}
                aria-controls="rp-toc-fixed-drawer"
                onClick={onToggleToc}
              >
                <TocIcon />
                <span className="rp-reading-dock__toc-label">{tocLabel}</span>
              </button>
            ) : null}
            {mobileActions}
          </div>
        </nav>
      ) : null}
    </>
  );
}
