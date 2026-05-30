import { useReportPageView } from '@fecommunity/reactpress-toolkit/ui';
import type { ReactNode } from 'react';

export const ViewStatistics = (props: { children?: ReactNode }) => {
  useReportPageView();
  return props.children ?? null;
};
