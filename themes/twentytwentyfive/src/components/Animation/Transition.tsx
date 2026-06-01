import React from 'react';

import s from '@/ui/ui.module.scss';

type ConditionTransitionProps = {
  visible: boolean;
  options?: Record<string, unknown>;
  children: React.ReactNode;
};

export const ConditionTransition: React.FC<ConditionTransitionProps> = ({ visible, children }) =>
  visible ? <div className={s.fadeIn}>{children}</div> : null;
