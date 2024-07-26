import { Preview } from '@storybook/react'
import { themes } from '@storybook/theming'
import React from 'react'

import Layout from './Layout'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
}

const localStorageResetDecorator = (Story) => {
  window.localStorage.clear()
  return <Story />
}

export const decorators = [
  localStorageResetDecorator,
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

  tags: ['autodocs'],
}

export default preview
