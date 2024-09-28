import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import SyncingBanner from './SyncingBanner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/components']}>
    <Route path="/:provider/:owner/:repo/components" exact={true}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('SyncingBanner', () => {
  describe('when rendered', () => {
    it('renders heading and content components', () => {
      render(<SyncingBanner />, { wrapper })
      const historicalDataTextLong = screen.getByText(
        'It might take up to 1 hour to view your data.'
      )
      expect(historicalDataTextLong).toBeInTheDocument()
    })
  })
})
