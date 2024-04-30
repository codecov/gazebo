import { Preview } from '@storybook/react'
import { themes } from '@storybook/theming'
import React from 'react'

import Layout from './Layout'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
}

export const decorators = [
  (Story) => (
    <Layout>
      <Story />
    </Layout>
  ),
]

const preview: Preview = {
  parameters: {
    docs: {
      theme: themes.light,
    },
  },
}

export default preview
