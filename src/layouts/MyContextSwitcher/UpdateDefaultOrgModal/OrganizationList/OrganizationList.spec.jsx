import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import OrganizationList from './OrganizationList'

jest.mock('ui/Avatar', () => () => 'Avatar')

const queryClient = new QueryClient()
const server = setupServer()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

const orgList = [
  {
    username: 'fearne-calloway-org',
    avatarUrl: 'https://github.com/fearne.png?size=40',
    defaultOrgUsername: null,
  },
  {
    username: 'ira-wendagoth-org',
    avatarUrl: 'https://github.com/fearne.png?size=40',
    defaultOrgUsername: null,
  },
]

const currentUser = {
  username: 'morrigan-org',
  avatarUrl: 'https://github.com/morri.png?size=40',
  defaultOrgUsername: 'fearne-calloway-org',
}

const contextData = {
  me: {
    owner: currentUser,
    myOrganizations: {
      edges: [{ node: orgList[0] }, { node: orgList[1] }],
    },
  },
}

const selectedOrgUsername = 'fearne-calloway-org'
const setSelectedOrgUsername = jest.fn()

const defaultProps = {
  selectedOrgUsername,
  setSelectedOrgUsername,
}

describe('OrganizationList', () => {
  function setup(data = contextData) {
    server.use(
      graphql.query('MyContexts', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(data))
      )
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('displays the usernames and avatars', async () => {
      render(<OrganizationList {...defaultProps} />, { wrapper })
      const fearneUsername = await screen.findByText(/fearne-calloway-org/)
      expect(fearneUsername).toBeInTheDocument()
      const defaultOrg = await screen.findByText(/Current default org/)
      expect(defaultOrg).toBeInTheDocument()

      const morriUsername = await screen.findByText(/morri/)
      expect(morriUsername).toBeInTheDocument()

      const iraWendagoth = await screen.findByText(/ira-wendagoth-org/)
      expect(iraWendagoth).toBeInTheDocument()

      const allAvatars = await screen.findAllByText(/Avatar/)
      expect(allAvatars).toHaveLength(3)
    })
  })
})
