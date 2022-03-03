module.exports = {
  core: {
    builder: "webpack5"
  },
  features: {
    storyStoreV7: true
  },
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-links', '@storybook/addon-essentials', '@storybook/preset-create-react-app', '@storybook/addon-controls'],
  framework: "@storybook/react"
};