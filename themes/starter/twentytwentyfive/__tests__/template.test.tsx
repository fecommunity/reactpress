import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../pages/index';

// Mock the toolkit API
jest.mock('@fecommunity/reactpress-toolkit', () => ({
  api: {
    article: {
      findAll: jest.fn().mockResolvedValue({ data: [] }),
    },
    category: {
      findAll: jest.fn().mockResolvedValue({ data: [] }),
    },
    tag: {
      findAll: jest.fn().mockResolvedValue({ data: [] }),
    },
  },
}));

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(
      <Home
        initialArticles={[]}
        initialCategories={[]}
        initialTags={[]}
      />
    );
    
    expect(screen.getByText('Latest Articles')).toBeInTheDocument();
  });

  it('displays navigation links', () => {
    render(
      <Home
        initialArticles={[]}
        initialCategories={[]}
        initialTags={[]}
      />
    );
    
    expect(screen.getByText('Latest Articles')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
  });
});