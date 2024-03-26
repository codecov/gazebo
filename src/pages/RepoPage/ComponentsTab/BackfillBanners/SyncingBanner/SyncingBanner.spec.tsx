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

describe('SyncingBanner', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['/gh/codecov/gazebo/components']}>
        <Route path="/:provider/:owner/:repo/components" exact={true}>
          <QueryClientProvider client={queryClient}>
            <SyncingBanner />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders heading and content components', () => {
      expect(screen.getByText('Pulling historical data')).toBeInTheDocument()
      expect(
        screen.getByText(
          'We are pulling in all of your historical components data, this will sometimes take a while. This page will update once data has been backfilled, feel free to navigate away in the meantime. For older data, it may take longer to populate.'
        )
      ).toBeInTheDocument()
    })
  })
})
