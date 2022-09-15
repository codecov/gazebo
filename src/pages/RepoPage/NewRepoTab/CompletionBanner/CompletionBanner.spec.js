import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import CompletionBanner from './CompletionBanner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

describe('CompletionBanner', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['/gh/codecov/gazebo/new']}>
        <Route path="/:provider/:owner/:repo/new" exact={true}>
          <QueryClientProvider client={queryClient}>
            <CompletionBanner />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders content', () => {
      expect(
        screen.getByText(/Once the steps are complete/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/How was your set up experience?/)
      ).toBeInTheDocument()
    })
  })
})
