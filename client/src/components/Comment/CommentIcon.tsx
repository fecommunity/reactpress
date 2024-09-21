import React, { useCallback } from 'react';

import { COMMENT_DOM_ID } from '@/components/Comment';

import styles from './CommentIcon.module.scss';

export const CommentIcon = () => {
  const intoView = useCallback(() => {
    const el = document.querySelector(`#${COMMENT_DOM_ID}`);
    el && el.scrollIntoView();
  }, []);

  return (
    <div className={styles.wrap} onClick={intoView}>
      <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em">
        <path
          d="M988.8 512a348.8 348.8 0 0 1-144.96 278.72v208.32l-187.84-131.52a387.2 387.2 0 0 1-56 4.8A408.64 408.64 0 0 1 384 811.84l-36.8-23.04a493.76 493.76 0 0 0 52.8 3.2 493.44 493.44 0 0 0 51.2-2.88c221.44-23.04 394.24-192 394.24-400a365.12 365.12 0 0 0-4.16-51.84 373.44 373.44 0 0 0-48.96-138.56l18.88 11.2A353.6 353.6 0 0 1 988.8 512z m-198.72-128c0-192-169.6-349.76-378.24-349.76h-24C192 47.04 33.92 198.72 33.92 384a334.08 334.08 0 0 0 118.4 253.12v187.52l86.08-60.48 66.24-46.4a396.16 396.16 0 0 0 107.52 16C620.48 734.08 790.08 576 790.08 384z"
          fill="currentColor"
        ></path>
      </svg>
    </div>
  );
};
