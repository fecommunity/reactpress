import cls from 'classnames';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import s from './ui.module.scss';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  text: string;
  type: ToastType;
}

let toastId = 0;
let pushToast: ((text: string, type: ToastType) => void) | null = null;

function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    pushToast = (text, type) => {
      const id = ++toastId;
      setItems((prev) => [...prev, { id, text, type }]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 2800);
    };
    return () => {
      pushToast = null;
    };
  }, []);

  if (typeof document === 'undefined' || !items.length) return null;

  return createPortal(
    <div className={s.toastHost} role="status" aria-live="polite">
      {items.map((item) => (
        <div
          key={item.id}
          className={cls(
            s.toast,
            item.type === 'error' && s.toastError,
            item.type === 'success' && s.toastSuccess,
            item.type === 'warning' && s.toastWarning,
          )}
        >
          {item.text}
        </div>
      ))}
    </div>,
    document.body,
  );
}

export const message = {
  success: (text: string) => pushToast?.(text, 'success'),
  error: (text: string) => pushToast?.(text, 'error'),
  info: (text: string) => pushToast?.(text, 'info'),
  warning: (text: string) => pushToast?.(text, 'warning'),
};

export function MessageHost() {
  return <ToastHost />;
}
