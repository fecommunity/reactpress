/** Shared Next.js defaults for ReactPress theme packages (Pages Router). */

export interface ReactPressNextConfig {
  reactStrictMode?: boolean;
  swcMinify?: boolean;
  eslint?: { ignoreDuringBuilds?: boolean };
  webpack?: (config: Record<string, unknown>, context: unknown) => Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Baseline Next config for themes: strict mode, eslint relaxed in CI, axios webpack alias.
 * Pass overrides to extend (your `webpack` runs after the supports-color alias).
 */
export function createReactPressNextConfig(
  overrides: ReactPressNextConfig = {},
): ReactPressNextConfig {
  const { webpack: userWebpack, eslint, ...rest } = overrides;

  return {
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
      ignoreDuringBuilds: true,
      ...(eslint || {}),
    },
    ...rest,
    webpack: (config, context) => {
      const nextConfig = config as {
        resolve?: { alias?: Record<string, unknown> };
      };
      nextConfig.resolve = nextConfig.resolve || {};
      nextConfig.resolve.alias = {
        ...nextConfig.resolve.alias,
        // axios → follow-redirects → debug optional peer supports-color@9 (ESM-only)
        'supports-color': false,
      };
      if (typeof userWebpack === 'function') {
        return userWebpack(config, context);
      }
      return config;
    },
  };
}
