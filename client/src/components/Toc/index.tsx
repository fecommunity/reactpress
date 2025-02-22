import cls from 'classnames';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ListTrail } from '@/components/Animation/Trail';
import { elementInViewport, isOdd } from '@/utils';

import style from './index.module.scss';

interface IToc {
  level: number;
  id: string;
  text: string;
  hasHeader?: boolean;
}

const HEIGHT = 32;

export const Toc: React.FC<{ tocs: Array<IToc>; maxHeight?: string | number; hasHeader?: boolean }> = ({
  tocs = [],
  maxHeight,
  hasHeader = true,
}) => {
  const t = useTranslations();
  const ref = useRef<HTMLDivElement>();
  const [active, setActive] = useState(0);
  const goto = useCallback((toc) => {
    try {
      const el = document.getElementById(toc.id);
      if (el) {
        el.scrollIntoView();
      }
    } catch (e) {} // eslint-disable-line no-empty
  }, []);

  useEffect(() => {
    const listener = () => {
      tocs.reduceRight((_, toc, index) => {
        const el = document.getElementById(toc.id);
        if (!el) {
          return _;
        }
        if (elementInViewport(el)) {
          setActive(index);
          ref.current.scrollTop = HEIGHT * index;
        }
        return _;
      }, null);
    };
    document.addEventListener('scroll', listener);

    return () => {
      document.removeEventListener('scroll', listener);
    };
  }, [tocs]);

  return (
    <div className={cls(style.wrapper, !hasHeader && style.noHeader)}>
      {hasHeader && <header>{t('toc')}</header>}
      <main>
        <div
          ref={ref}
          style={{
            maxHeight: typeof maxHeight === 'string' ? maxHeight : maxHeight + 'px',
          }}
        >
          <div>
            <ListTrail
              length={tocs.length}
              options={{
                height: 32,
                from: { height: 32 },
              }}
              element={'div'}
              renderItem={(idx) => {
                const toc = tocs[idx];
                const v = toc.level;
                const f = isOdd(v - 1);
                return (
                  <div
                    className={cls(style.item, idx === active && style.active)}
                    style={
                      {
                        'paddingLeft': 12 * (v - 1),
                        'cursor': 'pointer',
                        '--dot-left': 10 * (v - 2) + 'px',
                        '--dot-width': 6 - (v - 1) + (f ? 1 : 0) + 'px',
                      } as React.CSSProperties
                    }
                    onClick={() => goto(toc)}
                  >
                    <div className={style.tocText} title={toc.text} dangerouslySetInnerHTML={{ __html: toc.text }}/>
                  </div>
                );
              }}
            />
            <div className={style.indicator} style={{ top: HEIGHT * active + 'px' }} />
          </div>
        </div>
      </main>
    </div>
  );
};
