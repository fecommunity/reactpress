import { useThemeMod } from '@fecommunity/reactpress-toolkit/theme';

interface SiteTaglineProps {
  fallback?: string;
}

/** Site tagline from Customizer `displayTagline` (WP `bloginfo('description')`). */
export default function SiteTagline({
  fallback = 'A ReactPress powered site',
}: SiteTaglineProps) {
  const text = useThemeMod('displayTagline', fallback);
  if (!text) return null;

  return (
    <p className="site-tagline">{text}</p>
  );
}
