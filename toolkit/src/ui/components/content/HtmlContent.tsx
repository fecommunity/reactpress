import React, { useLayoutEffect, useRef } from 'react';

import { copyToClipboard } from '../../../utils/clipboard';

export interface HtmlContentProps {
  /** Server-rendered HTML (article body). */
  content?: string;
  className?: string;
  /** Label on the code-block copy button. */
  copyLabel?: string;
  /** Brief label shown on the copy button after a successful copy. */
  copySuccessLabel?: string;
  /** Called after a successful copy (optional; prefer `copySuccessLabel` for inline feedback). */
  onCopy?: () => void;
  /** Enable syntax highlight + line numbers (requires `highlight.js` in the theme). */
  highlightCode?: boolean;
}

function addLineNumbers(html: string): string {
  const text = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n$/, '');
  let num = 1;
  let result = `<span class="ln-num" data-num="${num}"></span>${text}`;
  result = result.replace(/\n/g, () => {
    num += 1;
    return `\n<span class="ln-num" data-num="${num}"></span>`;
  });
  return `<span class="ln-bg"></span>${result}`;
}

function attachWheelHandler(scrollEl: HTMLElement) {
  if (scrollEl.getAttribute('data-rp-wheel') === '1') return;

  const onWheel = (event: WheelEvent) => {
    const { scrollTop, scrollHeight, clientHeight } = scrollEl;
    const delta = event.deltaY;
    const canScrollUp = scrollTop > 0 && delta < 0;
    const canScrollDown = scrollTop + clientHeight < scrollHeight - 1 && delta > 0;
    if (canScrollUp || canScrollDown) {
      event.stopPropagation();
    }
  };

  scrollEl.addEventListener('wheel', onWheel, { passive: true, capture: true });
  scrollEl.setAttribute('data-rp-wheel', '1');
}

function highlightCodeElement(
  hljs: { highlightBlock?: (el: HTMLElement) => void; highlightElement?: (el: HTMLElement) => void },
  el: HTMLElement,
) {
  if (typeof hljs.highlightElement === 'function') {
    hljs.highlightElement(el);
    return;
  }
  hljs.highlightBlock?.(el);
}

function languageLabel(className: string): string | null {
  const match = className.match(/\blanguage-([\w-]+)\b/);
  if (!match) return null;
  return match[1];
}

function resolveCodeLanguage(
  className: string,
  plainText: string,
  hljs: { highlightAuto?: (code: string) => { language?: string } } | null,
): string {
  const fromClass = languageLabel(className);
  if (fromClass && fromClass !== 'plaintext') return fromClass;

  if (hljs?.highlightAuto && plainText.trim()) {
    try {
      const { language } = hljs.highlightAuto(plainText);
      if (language && language !== 'plaintext') return language;
    } catch {
      /* ignore auto-detect failures */
    }
  }

  return 'code';
}

function showCopyFeedback(
  btn: HTMLButtonElement,
  pre: HTMLElement,
  copyLabel: string,
  successLabel: string,
) {
  const prev = btn.getAttribute('data-rp-copy-timer');
  if (prev) window.clearTimeout(Number(prev));

  btn.textContent = '✓';
  btn.setAttribute('aria-label', successLabel);
  btn.classList.add('rp-copy-code-btn--copied');
  pre.classList.add('rp-code-copy-active');

  const timerId = window.setTimeout(() => {
    btn.textContent = copyLabel;
    btn.setAttribute('aria-label', copyLabel);
    btn.classList.remove('rp-copy-code-btn--copied');
    pre.classList.remove('rp-code-copy-active');
    btn.removeAttribute('data-rp-copy-timer');
  }, 1200);
  btn.setAttribute('data-rp-copy-timer', String(timerId));
}

function bindCopyButton(
  btn: HTMLButtonElement,
  pre: HTMLElement,
  el: HTMLElement,
  copyLabel: string,
  copySuccessLabel: string | undefined,
  onCopy: (() => void) | undefined,
) {
  if (!btn.classList.contains('rp-copy-code-btn--copied')) {
    btn.textContent = copyLabel;
    btn.setAttribute('aria-label', copyLabel);
  }
  btn.onclick = () => {
    if (!copyToClipboard(el.innerText)) return;
    if (copySuccessLabel) {
      showCopyFeedback(btn, pre, copyLabel, copySuccessLabel);
    }
    onCopy?.();
  };
}

function ensureToolbar(pre: HTMLElement, el: HTMLElement): HTMLElement {
  let toolbar = pre.querySelector(':scope > .rp-code-toolbar') as HTMLElement | null;
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.className = 'rp-code-toolbar';
    pre.insertBefore(toolbar, el);
    pre
      .querySelectorAll(':scope > .rp-code-window-dots, :scope > .rp-copy-code-btn, :scope > .rp-code-lang')
      .forEach((node) => {
        toolbar?.appendChild(node);
      });
  }
  return toolbar;
}

function updateLanguageLabel(toolbar: HTMLElement, lang: string) {
  const langEl = toolbar.querySelector('.rp-code-lang') as HTMLSpanElement | null;
  if (langEl) {
    langEl.textContent = lang;
    return;
  }

  const langLabel = document.createElement('span');
  langLabel.className = 'rp-code-lang';
  langLabel.textContent = lang;
  const copyBtn = toolbar.querySelector('.rp-copy-code-btn');
  if (copyBtn) {
    toolbar.insertBefore(langLabel, copyBtn);
  } else {
    toolbar.appendChild(langLabel);
  }
}

function enhanceCodeBlocks(
  root: HTMLElement,
  copyLabel: string,
  copySuccessLabel: string | undefined,
  onCopy: (() => void) | undefined,
  hljs: {
    highlightBlock?: (el: HTMLElement) => void;
    highlightElement?: (el: HTMLElement) => void;
    highlightAuto?: (code: string) => { language?: string };
  } | null,
) {
  root.querySelectorAll('pre code').forEach((block) => {
    const el = block as HTMLElement;
    const pre = el.parentElement;
    if (!pre) return;

    const plainText =
      pre.getAttribute('data-rp-plain') ??
      (el.className.includes('hljsln') ? el.innerText : el.textContent ?? '');
    if (!pre.getAttribute('data-rp-plain') && plainText) {
      pre.setAttribute('data-rp-plain', plainText);
    }

    if (hljs && !el.className.includes('hljs')) {
      if (el.className.includes('hljsln')) {
        el.textContent = el.innerText;
        el.className = el.className.replace(/\bhljsln\b/g, '').trim();
      }
      highlightCodeElement(hljs, el);
    }

    if (!el.className.includes('hljsln')) {
      el.innerHTML = addLineNumbers(el.innerHTML);
      el.className += ' hljsln';
    }

    const toolbar = ensureToolbar(pre, el);

    const copyBtn = toolbar.querySelector('.rp-copy-code-btn') as HTMLButtonElement | null;
    if (!copyBtn) {
      const newBtn = document.createElement('button');
      newBtn.type = 'button';
      newBtn.className = 'rp-copy-code-btn';
      toolbar.appendChild(newBtn);
      bindCopyButton(newBtn, pre, el, copyLabel, copySuccessLabel, onCopy);
    } else {
      bindCopyButton(copyBtn, pre, el, copyLabel, copySuccessLabel, onCopy);
    }

    if (!toolbar.querySelector('.rp-code-window-dots')) {
      const colorGroup = document.createElement('span');
      colorGroup.className = 'rp-code-window-dots';
      ['#dc3545', '#FFBD2E', '#27C93F'].forEach((color) => {
        const dot = document.createElement('i');
        dot.style.backgroundColor = color;
        colorGroup.appendChild(dot);
      });
      toolbar.insertBefore(colorGroup, toolbar.firstChild);
    }

    updateLanguageLabel(toolbar, resolveCodeLanguage(el.className, plainText, hljs));

    attachWheelHandler(el);
  });
}

/** Render HTML article body with optional code highlight and copy buttons. */
export function HtmlContent({
  content,
  className = 'rp-html-content markdown',
  copyLabel = 'Copy',
  copySuccessLabel,
  onCopy,
  highlightCode = true,
}: HtmlContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onCopyRef = useRef(onCopy);
  const copySuccessLabelRef = useRef(copySuccessLabel);
  const useInitialHtmlRef = useRef(true);

  onCopyRef.current = onCopy;
  copySuccessLabelRef.current = copySuccessLabel;

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !content) return undefined;

    let cancelled = false;

    const runEnhance = (
      hljs: {
        highlightBlock?: (el: HTMLElement) => void;
        highlightElement?: (el: HTMLElement) => void;
      } | null,
    ) => {
      if (cancelled) return;

      const contentChanged = root.getAttribute('data-rp-content') !== content;
      const missingBody = !root.querySelector('pre, p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, table');

      if (contentChanged || missingBody) {
        root.innerHTML = content;
        root.setAttribute('data-rp-content', content);
      }

      useInitialHtmlRef.current = false;
      enhanceCodeBlocks(
        root,
        copyLabel,
        copySuccessLabelRef.current,
        () => onCopyRef.current?.(),
        hljs,
      );
    };

    if (!highlightCode) {
      runEnhance(null);
      return () => {
        cancelled = true;
      };
    }

    runEnhance(null);

    void import('highlight.js')
      .then((mod) => {
        const loaded = (mod as { default?: typeof mod }).default ?? mod;
        runEnhance(loaded as {
          highlightBlock?: (el: HTMLElement) => void;
          highlightElement?: (el: HTMLElement) => void;
        });
      })
      .catch(() => {
        runEnhance(null);
      });

    return () => {
      cancelled = true;
    };
  }, [content, copyLabel, copySuccessLabel, highlightCode]);

  return (
    <div
      ref={ref}
      className={className}
      data-rp-component="html-content"
      suppressHydrationWarning
      {...(useInitialHtmlRef.current && content
        ? { dangerouslySetInnerHTML: { __html: content } }
        : {})}
    />
  );
}
