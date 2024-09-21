import { CheckOutlined, CopyOutlined } from '@ant-design/icons';
import copy from 'copy-to-clipboard';
import React, { useCallback, useRef } from 'react';

import { useToggle } from '@/hooks/useToggle';

import styles from './index.module.scss';

interface Props {
  text: string;
}

export const Copy: React.FC<Props> = ({ text }) => {
  const timerRef = useRef<NodeJS.Timeout>();
  const [copied, toggleCopied] = useToggle(false);
  const onClick = useCallback(() => {
    if (copied) {
      return;
    }
    copy(text);
    toggleCopied();
    timerRef.current = setTimeout(toggleCopied, 1500);
    // eslint-disable-next-line consistent-return
    return () => {
      clearTimeout(timerRef.current);
    };
  }, [text, copied, toggleCopied]);

  return (
    <span className={styles.wrapper}>
      {!copied ? <CopyOutlined onClick={onClick} /> : <CheckOutlined style={{ color: 'var(--primary-color)' }} />}
    </span>
  );
};
