'use client';

import { emojis } from '@/components/reactpress/comment/emojis';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const PANEL_WIDTH = 320;
const PANEL_HEIGHT = 240;
const PANEL_GAP = 8;

interface CommentEmojiProps {
  onPick: (emoji: string) => void;
  children: React.ReactNode;
}

export default function CommentEmoji({ onPick, children }: CommentEmojiProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    visibility: 'hidden',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;

    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      let left = rect.left;
      left = Math.max(PANEL_GAP, Math.min(left, window.innerWidth - PANEL_WIDTH - PANEL_GAP));

      let top = rect.top - PANEL_HEIGHT - PANEL_GAP;
      if (top < PANEL_GAP) {
        top = rect.bottom + PANEL_GAP;
      }

      setPanelStyle({
        position: 'fixed',
        top,
        left,
        width: PANEL_WIDTH,
        maxHeight: PANEL_HEIGHT,
        zIndex: 9999,
        visibility: 'visible',
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if ((target as Element).closest?.('.rp-comment-emoji-panel')) return;
      setOpen(false);
    };

    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const panel =
    open && mounted ? (
      <div className="rp-comment-emoji-panel is-portal" style={panelStyle} role="listbox">
        {Object.values(emojis).map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={emoji}
            onClick={() => {
              onPick(emoji);
              setOpen(false);
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div className="rp-comment-emoji-anchor" ref={anchorRef}>
      <button
        type="button"
        className="rp-comment-emoji-trigger"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {children}
      </button>
      {panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
