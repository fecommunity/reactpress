import React, { useEffect } from 'react';
import { resolvePublicAssetUrl } from '../../theme/content/assets';
import { useThemeMod, useThemeModBool } from '../context/ThemeRuntimeContext';

function BgImageHtmlClass({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('rp-has-bg-image', enabled);
    return () => document.documentElement.classList.remove('rp-has-bg-image');
  }, [enabled]);
  return null;
}

function escapeCssValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/** Injects Customizer colors, background, dark mode, and extra CSS (WP `theme_mod` → `:root`). */
export function ThemeCssVars() {
  const primary = useThemeMod('primaryColor', '#3b82f6');
  const accent = useThemeMod('accentColor', '#8b5cf6');
  const background = useThemeMod('backgroundColor', '#f8f9fa');
  const backgroundImage = resolvePublicAssetUrl(useThemeMod('backgroundImage', ''));
  const darkMode = useThemeModBool('darkMode', false);
  const additionalCss = useThemeMod('additionalCss', '').trim();
  const hasBgImage = Boolean(backgroundImage);

  const bgLayer = hasBgImage
    ? `background-image: url("${escapeCssValue(backgroundImage)}"); background-size: cover; background-position: center center; background-repeat: no-repeat; background-attachment: fixed;`
    : '';

  const darkVars = darkMode
    ? `
    --rp-background: #1a1a1a;
    --rp-text: #e8e8e8;
    --rp-muted: #a3a3a3;
    color-scheme: dark;
  `
    : `
    --rp-text: #1d2327;
    --rp-muted: #646970;
    color-scheme: light;
  `;

  const css = `
    :root {
      --rp-primary: ${primary};
      --rp-accent: ${accent};
      --rp-background: ${background};
      ${hasBgImage ? '--rp-has-bg-image: 1;' : ''}
      ${darkVars}
    }
    html${hasBgImage ? '.rp-has-bg-image' : ''} {
      ${bgLayer}
    }
    html,
    body {
      background-color: var(--rp-background, #f8f9fa) !important;
    }
    html.rp-has-bg-image,
    html.rp-has-bg-image body,
    html.rp-has-bg-image .container,
    html.rp-has-bg-image [data-rp-component='layout'],
    html.rp-has-bg-image [data-rp-component='main'] {
      background-color: transparent !important;
    }
    .container,
    [data-rp-component='layout'],
    [data-rp-component='main'] {
      background-color: ${hasBgImage ? 'transparent' : 'var(--rp-background, #f8f9fa)'} !important;
    }
    [data-rp-component='layout'][data-rp-dark='true'],
    [data-rp-component='layout'][data-rp-dark='true'] .container {
      background-color: var(--rp-background, #1a1a1a) !important;
      color: var(--rp-text, #e8e8e8);
    }
    [data-rp-component='layout'][data-rp-dark='true'] a {
      color: var(--rp-primary);
    }
    [data-rp-component='layout'] {
      color: var(--rp-text, #1d2327);
    }
    ${additionalCss}
  `;

  return (
    <>
      <BgImageHtmlClass enabled={hasBgImage} />
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}
