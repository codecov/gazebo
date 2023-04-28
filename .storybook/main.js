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
  docs: {
    autodocs: true,
    theme: {
      base: 'dark',
      brandTitle: 'Pavilion Storybook',
      brandUrl: 'https://app.codecov.io',
      color: {
        primary: 'rgb(240, 31, 122)',
      },
    },
  },
}
