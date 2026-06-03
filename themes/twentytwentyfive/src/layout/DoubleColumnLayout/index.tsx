import cls from 'classnames';
import dynamic from 'next/dynamic';
import React, { useEffect, useRef } from 'react';

import type { LikesProps } from '@/components/Likes';
import { useToggle } from '@fecommunity/reactpress-toolkit/theme';
import { getDocumentScrollTop } from '@/utils';

import style from './index.module.scss';

const SystemNotification = dynamic(() => import('@/components/Setting/SystemNotification'), { ssr: false });
const Likes = dynamic(() => import('@/components/Likes').then((m) => m.Likes), { ssr: false });
const CommentIcon = dynamic(() => import('@/components/Comment/CommentIcon').then((m) => m.CommentIcon), {
  ssr: false,
});

interface IProps {
  leftNode: React.ReactNode;
  leftClassName?: null | string;
  rightNode: React.ReactNode;
  rightClassName?: null | string;
  isRightNodeMobileHidden?: boolean;
  minHeight?: string | number;
  likesProps?: LikesProps;
  showComment?: boolean;
  topNode?: React.ReactNode;
}

export const DoubleColumnLayout: React.FC<IProps> = ({
  leftNode,
  leftClassName = null,
  rightNode,
  rightClassName = null,
  isRightNodeMobileHidden = true,
  minHeight = '100vh',
  likesProps,
  showComment = false,
  topNode
}) => {
  const $aside = useRef<HTMLElement>();
  const [showWidge, toggleWidge] = useToggle(true);

  useEffect(() => {
    let beforeY = 0;
    let ticking = false;
    const handler = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = getDocumentScrollTop();
        toggleWidge(beforeY <= y);
        beforeY = y;
        ticking = false;
      });
    };
    document.addEventListener('scroll', handler, { passive: true });
    return () => document.removeEventListener('scroll', handler);
  }, [toggleWidge]);

  useEffect(() => {
    const handler = (evt) => {
      const { id, isFxied, isFixedVisible, height } = evt.data;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      if (id !== 'header-state') return;
      const el = $aside.current.querySelector('.sticky') as HTMLElement;
      if (!el) return;
      if (viewportHeight < 800) {
        el.style.position = 'initial';
      } else {
        el.style.position = isFxied ? 'fixed' : 'sticky';
        el.style.marginTop = isFxied ? '0' : el.dataset.marginTop + 'px';
        el.style.transform = `translateY(${isFixedVisible ? height : 0})`;
      }
    };
    window.addEventListener('message', handler);

    return () => {
      window.removeEventListener('message', handler);
    };
  }, []);

  return (
    <div className={cls(style.outerWrap)} style={{ minHeight }}>
      <div className={cls('container')}>
        <SystemNotification />
        {topNode}
        <div className={style.wrap}>
          {(likesProps || showComment) && (
            <div
              className={cls(style.fixed, showWidge && style.active)}
              onClick={(e) => {
                e.preventDefault();
                e.nativeEvent.stopImmediatePropagation();
                e.stopPropagation();
              }}
            >
              {likesProps && (
                <div className={style.widgetWrapper}>
                  <Likes {...likesProps} />
                </div>
              )}
              {showComment && (
                <div className={style.widgetWrapper}>
                  <CommentIcon />
                </div>
              )}
            </div>
          )}

          <section className={cls(style.left, leftClassName)}>{leftNode}</section>
          <aside
            ref={$aside}
            className={cls(style.right, rightClassName, isRightNodeMobileHidden && style.isRightNodeMobileHidden)}
          >
            {rightNode}
          </aside>
        </div>
      </div>
    </div>
  );
};
