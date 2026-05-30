import React from 'react';
import { useSiteMeta, useThemeMod } from '../context/ThemeRuntimeContext';

export interface SiteBrandingProps {
  /** Last-resort title when customizer mod and site settings are both empty. */
  fallback?: string;
  className?: string;
  as?: 'h1' | 'span' | 'div';
}

/**
 * Site title: customizer `displayTitle` when set, otherwise `systemTitle` from site settings.
 */
export function SiteBranding({ fallback = '', className, as: Tag = 'span' }: SiteBrandingProps) {
  const mod = useThemeMod('displayTitle', '');
  const { siteName } = useSiteMeta();
  const title = mod.trim() || siteName.trim() || fallback;
  return <Tag className={className}>{title}</Tag>;
}
