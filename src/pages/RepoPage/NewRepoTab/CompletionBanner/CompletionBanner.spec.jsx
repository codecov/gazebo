import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import CompletionBanner from './CompletionBanner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

jest.mock('config')

describe('CompletionBanner', () => {
  function setup({ isSelfHosted = false } = {}) {
    config.IS_SELF_HOSTED = isSelfHosted

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

  describe('when rendered for self hosted users', () => {
    beforeEach(() => {
      setup({ isSelfHosted: true })
    })

    it('does not render github feedback links', () => {
      expect(
        screen.getByText(/Once the steps are complete/)
      ).toBeInTheDocument()
      expect(
        screen.queryByText(/How was your set up experience?/)
      ).not.toBeInTheDocument()
    })
  })
})
