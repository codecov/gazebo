import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useOwner } from 'services/user'

import MembersPage from './MembersPage'

jest.mock('services/user')
jest.mock('./Tabs', () => () => 'Tabs')

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
      expect(screen.getByText(/Members Page/)).toBeInTheDocument()
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
