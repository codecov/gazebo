import { Preview } from '@storybook/react'
import { themes } from '@storybook/theming'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

import Layout from './Layout'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
}

const queryClient = new QueryClient()

const localStorageResetDecorator = (Story) => {
  window.localStorage.clear()
  return <Story />
}

export const decorators = [
  localStorageResetDecorator,
  (Story) => (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Story />
      </Layout>
    </QueryClientProvider>
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
