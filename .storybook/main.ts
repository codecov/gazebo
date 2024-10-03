import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  core: {
    builder: '@storybook/builder-vite',
  },
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-create-react-app',
    '@chromatic-com/storybook',
  ],
  docs: {},
  staticDirs: ['../public'],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  // TODO: Remove this once we have removed CRACO, and index.html from the public folder
  viteFinal: async (config) => {
    const { mergeConfig } = await import('vite')

    return mergeConfig(config, {
      publicDir: false,
    })
  },
}

export default config
