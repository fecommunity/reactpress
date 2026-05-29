import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReactPressProvider } from '@fecommunity/reactpress-toolkit/theme';
import { ColorSchemeProvider } from '../contexts/ColorSchemeContext';

jest.mock('../components/ThemeShell', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('../components/HomeSidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar" />,
}));

jest.mock('../components/SystemNotice', () => ({
  __esModule: true,
  default: () => null,
}));

import ArchivesPage from '../pages/archives/index';

const reactPress = {
  locale: 'zh',
  locales: ['zh', 'en'],
  messages: {},
  catalog: {},
  themeId: 'twentytwentysix',
  activeThemeId: 'twentytwentysix',
  mods: {},
  isPreview: false,
  siteMeta: { siteName: 'Test', siteDescription: '' },
};

describe('Archives page', () => {
  it('shows archive summary and year headings', () => {
    render(
      <ReactPressProvider {...reactPress}>
        <ColorSchemeProvider>
          <ArchivesPage
            archives={{
              '2024': {
                '03': [{ id: '1', title: 'Hello', publishAt: '2024-03-01' }],
              },
            }}
          />
        </ColorSchemeProvider>
      </ReactPressProvider>,
    );

    expect(screen.getByRole('heading', { name: '时光圈' })).toBeInTheDocument();
    expect(screen.getByText('共计 1 篇')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
