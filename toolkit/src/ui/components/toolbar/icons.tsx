import type { SVGProps } from 'react';

import { RP_TOOLBAR_GLYPH_CLASS } from './constants';

type IconProps = Pick<SVGProps<SVGSVGElement>, 'className'> & {
  size?: number;
};

function glyphClass(className?: string) {
  return [RP_TOOLBAR_GLYPH_CLASS, className].filter(Boolean).join(' ');
}

export function SunIcon({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={glyphClass(className)}
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

export function MoonIcon({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={glyphClass(className)}
      aria-hidden
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function LanguagesIcon({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={glyphClass(className)}
      aria-hidden
    >
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  );
}

export function SearchIcon({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={glyphClass(className)}
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function TranslationToggleIcon({
  primaryGlyph,
  secondaryGlyph,
  primarySize = 10,
  secondarySize = 7.5,
  size = 20,
  className,
}: IconProps & {
  primaryGlyph: string;
  secondaryGlyph: string;
  primarySize?: number;
  secondarySize?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={glyphClass(className)}
      aria-hidden
    >
      <path d="M2.5 2h14.5a1.5 1.5 0 0 1 1.5 1.5v9.5a1.5 1.5 0 0 1-1.5 1.5H8.5L5 18.5V14H2.5a1.5 1.5 0 0 1-1.5-1.5V3.5A1.5 1.5 0 0 1 2.5 2z" />
      <text
        x="10"
        y="10.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="currentColor"
        stroke="none"
        fontSize={primarySize}
        fontWeight="600"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      >
        {primaryGlyph}
      </text>
      <text
        x="18.5"
        y="19.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="currentColor"
        stroke="none"
        fontSize={secondarySize}
        fontWeight="600"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      >
        {secondaryGlyph}
      </text>
    </svg>
  );
}

/** 中文态：气泡内「中」，右下角「A」。 */
export function LocaleZhToggleIcon(props: IconProps) {
  return (
    <TranslationToggleIcon
      primaryGlyph="中"
      secondaryGlyph="A"
      {...props}
    />
  );
}

/** 英文态：气泡内「A」，右下角「中」。 */
export function LocaleEnToggleIcon(props: IconProps) {
  return (
    <TranslationToggleIcon
      primaryGlyph="A"
      secondaryGlyph="中"
      {...props}
    />
  );
}

/** Active locale — switches between zh/en translation bubble icons. */
export function LocaleActiveIcon({
  locale,
  size = 20,
  className,
}: IconProps & { locale: string }) {
  if (locale === 'en') {
    return <LocaleEnToggleIcon size={size} className={className} />;
  }

  return <LocaleZhToggleIcon size={size} className={className} />;
}
