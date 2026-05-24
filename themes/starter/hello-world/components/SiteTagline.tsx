import { useSiteMeta, useThemeMod } from '@fecommunity/reactpress-toolkit/theme';

interface SiteTaglineProps {
  fallback?: string;
}

/** Site tagline: customizer `displayTagline` when set, otherwise `systemSubTitle`. */
export default function SiteTagline({ fallback = '' }: SiteTaglineProps) {
  const mod = useThemeMod('displayTagline', '');
  const { siteDescription } = useSiteMeta();
  const text = mod.trim() || siteDescription.trim() || fallback;
  if (!text) return null;

  return (
    <p className="site-tagline">
      {text}
      <style jsx>{`
        .site-tagline {
          margin: 0;
          max-width: 36rem;
          font-size: 0.9375rem;
          line-height: 1.6;
          color: var(--rp-muted, #666);
        }
      `}</style>
    </p>
  );
}
