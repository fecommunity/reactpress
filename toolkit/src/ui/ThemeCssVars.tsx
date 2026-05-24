import React from 'react';
import { useThemeMod } from './context/ThemeRuntimeContext';

/** Injects Customizer colors as CSS variables (WP `theme_mod` → `:root`). */
export function ThemeCssVars() {
  const primary = useThemeMod('primaryColor', '#3b82f6');
  const accent = useThemeMod('accentColor', '#8b5cf6');
  const background = useThemeMod('backgroundColor', '#f8f9fa');

  const css = `
    :root {
      --rp-primary: ${primary};
      --rp-accent: ${accent};
      --rp-background: ${background};
    }
    [data-rp-component='layout'] {
      background-color: var(--rp-background, #f8f9fa);
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
