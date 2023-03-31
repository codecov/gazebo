import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import UnsupportedView from './UnsupportedView'

const queryClient = new QueryClient()

const Template = (args) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={[
          '/gh/critical-role/bells-hells/blob/main/folder/file.png',
        ]}
      >
        <Route path="/:provider/:owner/:repo/blob/:branch/:path+">
          <UnsupportedView />
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

export const NormalUnsupportedView = Template.bind({})

export default {
  title: 'Components/UnsupportedView',
  component: UnsupportedView,
}
