const {
  createReactPressNextConfig,
} = require('@fecommunity/reactpress-toolkit/theme/next-config');

module.exports = createReactPressNextConfig({
  typescript: {
    // pnpm 工作区可能解析到多份 @types/react，不影响 Next 15 运行时。
    ignoreBuildErrors: true,
  },
});
