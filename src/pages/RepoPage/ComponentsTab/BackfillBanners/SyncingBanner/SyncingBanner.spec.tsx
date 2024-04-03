import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
      const historicalDataText = screen.getByText('Pulling historical data')
      expect(historicalDataText).toBeInTheDocument()
      const historicalDataTextLong = screen.getByText(
        'We are pulling in all of your historical components data, this will sometimes take a while. This page will update once data has been backfilled, feel free to navigate away in the meantime. For older data, it may take longer to populate.'
      )
      expect(historicalDataTextLong).toBeInTheDocument()
    })
  })
})
