'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type HomeFooterContextValue = {
  /** 为 true 时在页面底部展示 SiteFooter（列表页内容较少时）。 */
  showLayoutFooter: boolean;
  setShowLayoutFooter: (show: boolean) => void;
};

const HomeFooterContext = createContext<HomeFooterContextValue | null>(null);

export function HomeFooterProvider({ children }: { children: ReactNode }) {
  // 默认展示底部 footer；列表页内容较多时由 useFeedFooterPlacement 在 layout 阶段切换为侧栏。
  const [showLayoutFooter, setShowLayoutFooter] = useState(true);
  const value = useMemo(
    () => ({ showLayoutFooter, setShowLayoutFooter }),
    [showLayoutFooter],
  );

  return <HomeFooterContext.Provider value={value}>{children}</HomeFooterContext.Provider>;
}

export function useHomeFooter() {
  const context = useContext(HomeFooterContext);
  if (!context) {
    throw new Error('useHomeFooter must be used within HomeFooterProvider');
  }
  return context;
}
