import React from 'react';
import { useThemeMod } from './context/ThemeRuntimeContext';

export interface SiteBrandingProps {
  /** Fallback when `displayTitle` mod is unset. */
  fallback: string;
  className?: string;
  as?: 'h1' | 'span' | 'div';
}

/** Site title from Customizer `displayTitle` (WP `bloginfo('name')`). */
export function SiteBranding({ fallback, className, as: Tag = 'span' }: SiteBrandingProps) {
  const title = useThemeMod('displayTitle', fallback);
  return <Tag className={className}>{title || fallback}</Tag>;
}
