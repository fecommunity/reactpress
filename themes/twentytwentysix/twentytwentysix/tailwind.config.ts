import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['selector', '[data-color-scheme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: 'var(--primary-color)',
        surface: 'var(--bg-box)',
        muted: 'var(--second-text-color)',
        foreground: 'var(--main-text-color)',
      },
      borderRadius: {
        theme: 'var(--border-radius)',
      },
    },
  },
  // Avoid Tailwind `.container` max-width on theme shell (use `.site-container` instead).
  corePlugins: {
    container: false,
  },
  plugins: [],
};

export default config;
