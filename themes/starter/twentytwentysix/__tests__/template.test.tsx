import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReactPressProvider } from '@fecommunity/reactpress-toolkit/theme';
import { ColorSchemeProvider } from '../contexts/ColorSchemeContext';
import Home from '../pages/index';

const reactPress = {
  locale: 'zh',
  locales: ['zh', 'en'],
  messages: {},
  catalog: {},
  themeId: 'twentytwentysix',
  activeThemeId: 'twentytwentysix',
  mods: {},
  isPreview: false,
  siteMeta: { siteName: 'Test', siteDescription: 'Test site' },
};

function renderHome(props: React.ComponentProps<typeof Home>) {
  return render(
    <ReactPressProvider {...reactPress}>
      <ColorSchemeProvider>
        <Home {...props} />
      </ColorSchemeProvider>
    </ReactPressProvider>,
  );
}

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

jest.mock('../lib/fetch', () => ({
  ...jest.requireActual('../lib/fetch'),
  fetchPublishedPages: jest.fn().mockResolvedValue({ pages: [] }),
}));

jest.mock('@fecommunity/reactpress-toolkit/theme', () => {
  const actual = jest.requireActual('@fecommunity/reactpress-toolkit/theme');
  return {
    ...actual,
    useNavActive: () => 'home',
    useThemeModBool: () => true,
    useSiteMeta: () => ({ siteName: 'Test', siteDescription: 'Test site' }),
    useThemeMod: (_key: string, fallback: string) => fallback,
    LocaleSwitcher: () => null,
  };
});

describe('Twenty Twenty-Six Home', () => {
  it('renders category menu', () => {
    renderHome({
      initialArticles: [],
      articleTotal: 0,
      initialCategories: [{ value: 'tech', label: 'Tech', articleCount: 2 }],
      initialTags: [],
      recommended: [],
    });

    expect(screen.getByRole('navigation', { name: '文章分类' })).toBeInTheDocument();
    expect(screen.getAllByText('Tech').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('所有')).toBeInTheDocument();
  });

  it('renders sidebar widgets', () => {
    renderHome({
      initialArticles: [],
      articleTotal: 0,
      initialCategories: [{ value: 'demo', label: 'Demo', articleCount: 1 }],
      initialTags: [{ value: 'tag', label: 'Tag', articleCount: 1 }],
      recommended: [],
    });

    expect(screen.getByRole('heading', { name: /推荐阅读/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /文章标签/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /关于我们/ })).toBeInTheDocument();
  });

  it('shows empty state when no articles', () => {
    renderHome({
      initialArticles: [],
      articleTotal: 0,
      initialCategories: [],
      initialTags: [],
      recommended: [],
    });

    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });
});
