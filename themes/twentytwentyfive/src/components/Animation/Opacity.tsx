import React from 'react';

import s from '@/ui/ui.module.scss';

export const Opacity: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className={s.fadeIn}>{children}</div>
);
