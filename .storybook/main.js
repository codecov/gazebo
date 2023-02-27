const webpack = require('webpack')

module.exports = {
  core: {
    builder: 'webpack5',
  },
  features: { storyStoreV7: true },
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-create-react-app',
    '@storybook/addon-controls',
  ],
  framework: '@storybook/react',
  // Work around for storybook react-cra dep issues between webpack 4 + 5
  webpackFinal: async (config) => ({
    ...config,
    plugins: [
      ...config.plugins.filter(
        (plugin) => plugin.constructor.name !== 'IgnorePlugin'
      ),
      new webpack.IgnorePlugin({
        resourceRegExp: /react-dom\/client$/,
        contextRegExp:
          /(app\/react|app\\react|@storybook\/react|@storybook\\react)/,
      }),
    ],
  }),
}
