import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../pages/index';

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

jest.mock('@fecommunity/reactpress-toolkit/theme', () => {
  const actual = jest.requireActual('@fecommunity/reactpress-toolkit/theme');
  return {
    ...actual,
    useNavActive: () => 'home',
    useThemeModBool: () => true,
    useSiteMeta: () => ({ siteName: 'Test', siteDescription: 'Test site' }),
    useThemeMod: (_key: string, fallback: string) => fallback,
  };
});

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(
      <Home
        initialArticles={[]}
        initialCategories={[]}
        initialTags={[]}
      />,
    );

    expect(screen.getByText('Latest Articles')).toBeInTheDocument();
  });

  it('displays sidebar widget titles', () => {
    render(
      <Home
        initialArticles={[]}
        initialCategories={[{ value: 'demo', label: 'Demo', articleCount: 1 }]}
        initialTags={[{ value: 'tag', label: 'Tag', articleCount: 1 }]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Popular Tags' })).toBeInTheDocument();
    expect(screen.getAllByText('Categories').length).toBeGreaterThanOrEqual(1);
  });
});
