import React from 'react';
import { useSiteMeta } from './context';
import { useThemeMod } from './context/ThemeRuntimeContext';

export interface SiteTaglineProps {
  /** Used when customizer tagline and site subtitle are both empty. */
  fallback?: string;
  className?: string;
}

/** Site tagline: customizer `displayTagline` when set, otherwise `systemSubTitle`. */
export function SiteTagline({ fallback = '', className = 'site-tagline' }: SiteTaglineProps) {
  const mod = useThemeMod('displayTagline', '');
  const { siteDescription } = useSiteMeta();
  const text = mod.trim() || siteDescription.trim() || fallback.trim();
  if (!text) return null;

  return (
    <p className={className} data-rp-component="site-tagline">
      {text}
    </p>
  );
}
