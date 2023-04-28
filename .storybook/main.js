module.exports = {
  core: {
    builder: 'webpack5',
  },
  framework: {
    name: '@storybook/react-webpack5',
    options: { fastRefresh: true },
  },
  features: {
    react18: true,
  },
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-create-react-app',
  ],
  // Work around for storybook react-cra dep issues between webpack 4 + 5
  webpackFinal: async (config) => ({
    ...config,
    plugins: [
      ...config.plugins.filter(
        (plugin) => plugin.constructor.name !== 'IgnorePlugin'
      ),
    ],
  }),
}
