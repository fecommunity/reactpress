import React from 'react';
import { isLikelyValidHeaderLogoPath, resolvePublicAssetUrl } from '../../theme/content/assets';
import { useSiteMeta, useThemeMod } from '../context/ThemeRuntimeContext';

export interface SiteLogoProps {
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
}

/** Site logo: customizer `siteLogo` when set, otherwise `systemLogo` from site settings. */
export function SiteLogo({ className, alt, width = 48, height = 48 }: SiteLogoProps) {
  const mod = useThemeMod('siteLogo', '').trim();
  const { siteLogo } = useSiteMeta();
  const raw = mod || siteLogo?.trim() || '';
  if (!isLikelyValidHeaderLogoPath(raw)) return null;
  const src = resolvePublicAssetUrl(raw);
  const [hidden, setHidden] = React.useState(false);

  if (!src || hidden) return null;

  return (
    <img
      src={src}
      alt={alt ?? ''}
      className={className}
      width={width}
      height={height}
      decoding="async"
      onError={() => setHidden(true)}
    />
  );
}
