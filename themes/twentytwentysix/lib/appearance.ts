import type { ThemeMods } from '@fecommunity/reactpress-toolkit/theme';
import {
  appearancePrimaryColorForMode,
  buildBrandingAppearanceCss,
} from '@fecommunity/reactpress-toolkit/theme';

/**
 * Maps Customizer color mods to shadcn-style HSL design tokens for Tailwind.
 * Reuses Twenty Twenty-Five hex vars (--primary-color, --bg-body) as bridge.
 */
export function buildTwentyTwentySixAppearanceCss(mods: ThemeMods): string {
  const base = buildBrandingAppearanceCss(mods);
  const lightPrimary = appearancePrimaryColorForMode(mods, false, '#3b82f6');
  const darkPrimary = appearancePrimaryColorForMode(mods, true, '#60a5fa');

  const tokens = `
body:not(.dark) {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83% 53%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83% 53%;
  --radius: 0.5rem;
}
body.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --primary: 217.2 91% 60%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
}
body:not(.dark) { --primary-color: ${lightPrimary}; }
body.dark { --primary-color: ${darkPrimary}; }
`;

  return `${base}\n${tokens}`;
}
