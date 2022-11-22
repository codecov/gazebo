import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useOwner } from 'services/user'

import PlanPage from './PlanPage'

jest.mock('./Header', () => () => 'Header')
jest.mock('services/user')
jest.mock('config')

jest.mock('./Tabs', () => () => 'Tabs')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

describe('PlanPage', () => {
  let testLocation
  function setup({ owner = null, isSelfHosted = false }) {
    config.IS_SELF_HOSTED = isSelfHosted

    useOwner.mockReturnValue({
      data: owner,
    })
    render(
      <MemoryRouter initialEntries={['/plan/gh/codecov']}>
        <Route path="/plan/:provider/:owner">
          <QueryClientProvider client={queryClient}>
            <PlanPage />
          </QueryClientProvider>
        </Route>
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
      </MemoryRouter>
    )
  }

  describe('when the owner is part of org', () => {
    beforeEach(() => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
        },
      })
    })

    it('renders tabs associated with the page', () => {
      expect(screen.getByText(/Tabs/)).toBeInTheDocument()
    })
  })

  describe('when user is not part of the org', () => {
    beforeEach(() => {
      setup({
        owner: {
          owner: {
            username: 'codecov',
            isCurrentUserPartOfOrg: false,
          },
        },
      })
    })

    it('doesnt render Tabs', () => {
      expect(screen.queryByText(/Tabs/)).not.toBeInTheDocument()
    })
  })

  describe('when the environment is self-hosted', () => {
    beforeEach(() => {
      setup({
        owner: {
          owner: {
            username: 'codecov',
            isCurrentUserPartOfOrg: false,
          },
        },
        isSelfHosted: true,
      })
    })

    it('doesnt render tabs', () => {
      expect(screen.queryByText(/Tabs/)).not.toBeInTheDocument()
      expect(testLocation.pathname).toBe('/gh/codecov')
    })
  })
})
