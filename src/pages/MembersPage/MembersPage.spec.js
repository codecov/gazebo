import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useOwner } from 'services/user'

import MembersPage from './MembersPage'

jest.mock('services/user')
jest.mock('./Tabs', () => () => 'Tabs')
jest.mock('./Header', () => () => 'Header')
jest.mock('./MembersActivation', () => () => 'MemberActivation')
jest.mock('./MissingMemberBanner', () => () => 'MissingMemberBanner')
jest.mock('./MembersList', () => () => 'MembersList')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

describe('MembersPage', () => {
  function setup({ owner = null }) {
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
})
