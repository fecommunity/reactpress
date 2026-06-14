module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks', 'simple-import-sort', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  overrides: [
    {
      files: ['**/*.{ts,tsx,js,jsx}'],
      parserOptions: {
        project: ['./client/tsconfig.json'],
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
  ],
  settings: {
    react: {
      version: '17.0',
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
    'react-hooks/exhaustive-deps': 2,
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 0,
    'prettier/prettier': 'error',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
  },
  ignorePatterns: ['dist/', 'node_modules', 'scripts'],
};
