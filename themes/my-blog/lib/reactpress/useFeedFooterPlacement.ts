'use client';

import { useLayoutEffect } from 'react';

import {
  shouldPlaceFooterInSidebar,
  type FeedFooterPlacementOptions,
} from '@/lib/reactpress/feedFooterPlacement';
import { useHomeFooter } from '@/lib/reactpress/homeFooter';

export function useFeedFooterPlacement(options: FeedFooterPlacementOptions) {
  const { setShowLayoutFooter } = useHomeFooter();
  const footerInSidebar = shouldPlaceFooterInSidebar(options);
  const footerAtBottom = !footerInSidebar;

  useLayoutEffect(() => {
    setShowLayoutFooter(footerAtBottom);
    return () => setShowLayoutFooter(false);
  }, [footerAtBottom, setShowLayoutFooter]);

  return { footerInSidebar, footerAtBottom };
}
