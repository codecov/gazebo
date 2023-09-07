import type { StorybookConfig } from '@storybook/react-webpack5'
import remarkGfm from 'remark-gfm'


const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-webpack5',
    options: {
      fastRefresh: true,
    },
  },
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-create-react-app',
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],
  docs: {
    autodocs: true,
  },
}

export default config
