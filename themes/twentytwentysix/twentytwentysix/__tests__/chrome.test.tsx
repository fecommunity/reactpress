import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReactPressProvider } from '@fecommunity/reactpress-toolkit/theme';
import { ColorSchemeProvider } from '../contexts/ColorSchemeContext';
import LocaleToggle from '../components/chrome/LocaleToggle';
import ColorSchemeToggle from '../components/chrome/ColorSchemeToggle';

const reactPress = {
  locale: 'zh',
  locales: ['zh', 'en'],
  messages: {},
  catalog: {},
  themeId: 'twentytwentysix',
  activeThemeId: 'twentytwentysix',
  mods: { darkMode: '1' },
  isPreview: false,
  siteMeta: { siteName: 'Test', siteDescription: '' },
};

function wrap(ui: React.ReactNode) {
  return (
    <ReactPressProvider {...reactPress}>
      <ColorSchemeProvider>{ui}</ColorSchemeProvider>
    </ReactPressProvider>
  );
}

describe('Header chrome', () => {
  it('switches locale between zh and en', () => {
    render(wrap(<LocaleToggle />));
    const trigger = screen.getByRole('button', { name: /switch language|切换语言/i });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('menuitem', { name: 'English' }));
    fireEvent.click(trigger);
    expect(screen.getByRole('menuitem', { name: 'English' })).toHaveAttribute('aria-current', 'true');
  });

  it('toggles color scheme', () => {
    render(wrap(<ColorSchemeToggle />));
    const btn = screen.getByRole('button', { name: '浅色模式' });
    fireEvent.click(btn);
    expect(document.documentElement).toHaveAttribute('data-color-scheme', 'light');
  });
});
