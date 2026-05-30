import React, { useEffect, useRef } from 'react';

import { copyToClipboard } from '../../../utils/clipboard';

export interface HtmlContentProps {
  /** Server-rendered HTML (article body). */
  content?: string;
  className?: string;
  /** Label on the code-block copy button. */
  copyLabel?: string;
  /** Called after a successful copy. */
  onCopy?: () => void;
  /** Enable syntax highlight + line numbers (requires `highlight.js` in the theme). */
  highlightCode?: boolean;
}

function addLineNumbers(html: string): string {
  let num = 1;
  let result = `<span class="ln-num" data-num="${num}"></span>${html}`;
  result = result.replace(/\r\n|\r|\n/g, () => {
    num += 1;
    return `\n<span class="ln-num" data-num="${num}"></span>`;
  });
  return `<span class="ln-bg"></span>${result}`;
}

/** Render HTML article body with optional code highlight and copy buttons. */
export function HtmlContent({
  content,
  className = 'rp-html-content markdown',
  copyLabel = 'Copy',
  onCopy,
  highlightCode = true,
}: HtmlContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!content || !ref.current) return;
    const range = document.createRange();
    const slot = range.createContextualFragment(content);
    ref.current.innerHTML = '';
    ref.current.appendChild(slot);
  }, [content]);

  useEffect(() => {
    if (!highlightCode || !ref.current || !content) return undefined;

    let hljs: { highlightBlock: (el: HTMLElement) => void } | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      hljs = require('highlight.js');
    } catch {
      return undefined;
    }

    const cleanups: Array<() => void> = [];

    const timer = window.setTimeout(() => {
      const blocks = ref.current?.querySelectorAll('pre code');
      blocks?.forEach((block) => {
        const el = block as HTMLElement;
        if (!el.className.includes('hljsln')) {
          el.innerHTML = addLineNumbers(el.innerHTML);
          el.className += ' hljsln';
        }

        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'rp-copy-code-btn';
        copyBtn.textContent = copyLabel;
        copyBtn.onclick = () => {
          if (copyToClipboard(el.innerText)) onCopy?.();
        };
        el.parentNode?.insertBefore(copyBtn, el);

        const colorGroup = document.createElement('span');
        colorGroup.className = 'rp-code-window-dots';
        ['#dc3545', '#FFBD2E', '#27C93F'].forEach((color) => {
          const dot = document.createElement('i');
          dot.style.backgroundColor = color;
          colorGroup.appendChild(dot);
        });
        el.parentNode?.insertBefore(colorGroup, el);

        cleanups.push(() => {
          copyBtn.remove();
          colorGroup.remove();
        });

        hljs?.highlightBlock(el);
      });
    }, 0);

    return () => {
      window.clearTimeout(timer);
      cleanups.forEach((fn) => fn());
    };
  }, [content, copyLabel, highlightCode, onCopy]);

  return (
    <div
      ref={ref}
      className={className}
      data-rp-component="html-content"
    />
  );
}
