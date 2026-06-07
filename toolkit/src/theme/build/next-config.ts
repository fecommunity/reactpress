/** Shared Next.js defaults for ReactPress theme packages (Pages Router). */

import path from 'path';

export interface ReactPressNextConfig {
  reactStrictMode?: boolean;
  eslint?: { ignoreDuringBuilds?: boolean };
  transpilePackages?: string[];
  webpack?: (config: Record<string, unknown>, context: unknown) => Record<string, unknown>;
  [key: string]: unknown;
}

function resolveFromApp(appDir: string, spec: string): string {
  return require.resolve(spec, { paths: [appDir] });
}

/** Pin React to one copy so lazy-loaded page chunks share the same runtime (pnpm monorepo). */
function applyThemeWebpackResolve(
  config: Record<string, unknown>,
  appDir: string,
): Record<string, unknown> {
  const nextConfig = config as {
    resolve?: {
      alias?: Record<string, unknown>;
      modules?: string[] | string;
    };
  };
  nextConfig.resolve = nextConfig.resolve || {};
  const reactDir = path.dirname(resolveFromApp(appDir, 'react/package.json'));
  const reactDomDir = path.dirname(resolveFromApp(appDir, 'react-dom/package.json'));
  const themeNodeModules = path.join(appDir, 'node_modules');
  nextConfig.resolve.modules = [
    themeNodeModules,
    ...(Array.isArray(nextConfig.resolve.modules)
      ? nextConfig.resolve.modules
      : nextConfig.resolve.modules
        ? [nextConfig.resolve.modules]
        : []),
    'node_modules',
  ];
  nextConfig.resolve.alias = {
    ...nextConfig.resolve.alias,
    // axios → follow-redirects → debug optional peer supports-color@9 (ESM-only)
    'supports-color': false,
    react: reactDir,
    'react-dom': reactDomDir,
    'react/jsx-runtime': resolveFromApp(appDir, 'react/jsx-runtime'),
    'react/jsx-dev-runtime': resolveFromApp(appDir, 'react/jsx-dev-runtime'),
  };
  return config;
}

/**
 * Baseline Next config for themes: strict mode, eslint relaxed in CI, axios webpack alias.
 * Pass overrides to extend (your `webpack` runs after the supports-color alias).
 */
export function createReactPressNextConfig(
  overrides: ReactPressNextConfig = {},
): ReactPressNextConfig {
  const { webpack: userWebpack, eslint, transpilePackages, ...rest } = overrides;

  return {
    reactStrictMode: true,
    transpilePackages: ['@fecommunity/reactpress-toolkit', ...(transpilePackages ?? [])],
    eslint: {
      ignoreDuringBuilds: true,
      ...(eslint || {}),
    },
    ...rest,
    webpack: (config, context) => {
      const ctx = context as { dir?: string; dev?: boolean; isServer?: boolean };
      const appDir = ctx.dir ?? process.cwd();
      applyThemeWebpackResolve(config, appDir);
      if (typeof userWebpack === 'function') {
        return userWebpack(config, context);
      }
      return config;
    },
  };
}
