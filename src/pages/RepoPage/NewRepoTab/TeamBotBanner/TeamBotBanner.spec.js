import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import TeamBotBanner from './TeamBotBanner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

describe('TeamBotBanner', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['/gh/codecov/gazebo/new']}>
        <Route path="/:provider/:owner/:repo/new" exact={true}>
          <QueryClientProvider client={queryClient}>
            <TeamBotBanner />
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
      expect(screen.getByText('Next, set up a')).toBeInTheDocument()
      expect(
        screen.getByText(
          /Codecov will use the integration to post statuses and comments./
        )
      ).toBeInTheDocument()
    })
  })
})
