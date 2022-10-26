import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useOwner } from 'services/user'

import MembersPage from './MembersPage'

jest.mock('services/user')
jest.mock('./Tabs', () => () => 'Tabs')
jest.mock('./Header', () => () => 'Header')
jest.mock('./MembersActivation', () => () => 'MemberActivation')
jest.mock('./MissingMemberBanner', () => () => 'MissingMemberBanner')
jest.mock('./MembersList', () => () => 'MembersList')
jest.mock('config')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

let testLocation
describe('MembersPage', () => {
  function setup({ owner = null, isEnterprise = false }) {
    config.IS_ENTERPRISE = isEnterprise

    useOwner.mockReturnValue({
      data: owner,
    })
    render(
      <MemoryRouter initialEntries={['/members/gh/codecov']}>
        <Route path="/members/:provider/:owner">
          <QueryClientProvider client={queryClient}>
            <MembersPage />
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

  describe('when the owner exists', () => {
    beforeEach(() => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
        },
      })
    })

    it('renders the base text', () => {
      expect(screen.getByText(/Manage members/)).toBeInTheDocument()
    })

    it('renders the Header', () => {
      expect(screen.getByText(/Header/)).toBeInTheDocument()
    })

    it('renders the Member Activation', () => {
      expect(screen.getByText(/MemberActivation/)).toBeInTheDocument()
    })

    it('renders the Missing Member Banner', () => {
      expect(screen.getByText(/MissingMemberBanner/)).toBeInTheDocument()
    })

    it('renders the Missing Members List', () => {
      expect(screen.getByText(/MembersList/)).toBeInTheDocument()
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

  describe('when user is an enterprise account', () => {
    beforeEach(() => {
      setup({
        isEnterprise: true,
      })
    })

    it('redirects to owner page', () => {
      expect(testLocation.pathname).toBe('/gh/codecov')
    })
  })
})
