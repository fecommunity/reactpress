import React from 'react';
import { resolvePublicAssetUrl } from '../theme/assets';
import { useSiteMeta, useThemeMod } from './context/ThemeRuntimeContext';

export interface SiteLogoProps {
  className?: string;
  alt?: string;
}

/** Site logo: customizer `siteLogo` when set, otherwise `systemLogo` from site settings. */
export function SiteLogo({ className, alt }: SiteLogoProps) {
  const mod = useThemeMod('siteLogo', '').trim();
  const { siteLogo } = useSiteMeta();
  const raw = mod || siteLogo?.trim() || '';
  const src = resolvePublicAssetUrl(raw);
  if (!src) return null;
  return <img src={src} alt={alt ?? ''} className={className} />;
}
