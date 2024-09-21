import hljs from 'highlight.js';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef } from 'react';

import { copy } from '@/utils/copy';

import styles from './index.module.scss';

export const MarkdownReader = ({ content }) => {
  const ref = useRef<HTMLDivElement>();
  const t = useTranslations();

  function addLineNumbersForCode(html) {
    let num = 1;
    html = '<span class="ln-num" data-num="' + num + '"></span>' + html;
    // 替换每一行的\n为行号
    html = html.replace(/\r\n|\r|\n/g, function (a) {
      num++;      
      return a + '<span class="ln-num" data-num="' + num + '"></span>';
    });
    html = '<span class="ln-bg"></span>' + html;
    return html;
  }

  useEffect(() => {
    if (!content) {
      return;
    }
    const el = ref.current;
    const range = document.createRange();
    const slot = range.createContextualFragment(content);
    el.innerHTML = '';
    el.appendChild(slot);
  }, [content]);

  // 高亮
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const callbacks = [];

    setTimeout(() => {
      const blocks = ref.current.querySelectorAll('pre code');
      blocks.forEach((block: HTMLElement) => {
        // 添加行号
        if (block.className.indexOf('hljsln') == -1) {
          let html = block.innerHTML;
          html = addLineNumbersForCode(html);
          block.innerHTML = html;
          block.className += ' hljsln';
        }

        const span = document.createElement('span');
        span.classList.add(styles.copyCodeBtn);
        span.innerText = t('copy') as string;
        span.onclick = () => copy(block.innerText, t);
        block.parentNode.insertBefore(span, block);

        // 左侧插入插入红黄绿
        const colorGroup = document.createElement('span');
        colorGroup.classList.add(styles.colorGroup);
        block.parentNode.insertBefore(colorGroup, block);
        ['#dc3545', '#FFBD2E', '#27C93F'].forEach((color) => {
          const i = document.createElement('i');
          i.style.backgroundColor = color;
          colorGroup.appendChild(i);
        });

        callbacks.push(() => {
          block.parentNode.removeChild(span);
        });

        hljs.highlightBlock(block);
      });
    }, 0);

    // eslint-disable-next-line consistent-return
    return () => {
      callbacks.forEach((cb) => cb());
    };
  }, [content, t]);

  return <div ref={ref} className={'markdown'}></div>;
};
