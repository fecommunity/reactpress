module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks', 'simple-import-sort', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  overrides: [
    {
      files: ['web/**/*.{ts,tsx}'],
      parserOptions: {
        project: ['./web/tsconfig.eslint.json'],
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['toolkit/**/*.ts'],
      parserOptions: {
        project: ['./toolkit/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['server/**/*.ts'],
      parserOptions: {
        project: ['./server/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['docs/**/*.{ts,tsx}'],
      parserOptions: {
        project: ['./docs/tsconfig.eslint.json'],
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['themes/hello-world/**/*.{ts,tsx}'],
      parserOptions: {
        project: ['./themes/hello-world/tsconfig.eslint.json'],
        tsconfigRootDir: __dirname,
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        paths: ['./'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  rules: {
    'func-names': 0,
    'no-shadow': 0,
    '@typescript-eslint/no-shadow': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-unused-vars': [0, { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/ban-ts-ignore': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-this-alias': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/ban-types': 0,
    'react-hooks/rules-of-hooks': 2,
    'react-hooks/exhaustive-deps': 1,
    'react/prop-types': 0,
    'testing-library/no-unnecessary-act': 0,
    'react/react-in-jsx-scope': 0,
    // Prettier 2.x cannot parse modern TS (`import type`, inline `type` imports).
    // web uses `vp fmt` (Oxfmt); keep formatting out of ESLint to avoid false IDE errors.
    'prettier/prettier': 0,
    'simple-import-sort/imports': 'off',
    'simple-import-sort/exports': 'off',
  },
  ignorePatterns: [
    'dist/',
    'node_modules',
    'scripts',
    'examples',
    '**/.next',
    'toolkit/dist',
    'server/dist',
    'web/src/routeTree.gen.ts',
  ],
};
