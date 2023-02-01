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
    username: 'fearne-calloway',
    avatarUrl: 'https://github.com/fearne.png?size=40',
    defaultOrgUsername: null,
  },
  {
    username: 'ira-wendagoth',
    avatarUrl: 'https://github.com/fearne.png?size=40',
    defaultOrgUsername: null,
  },
]

const contextData = {
  me: {
    owner: {
      username: 'morrigan',
      avatarUrl: 'https://github.com/morri.png?size=40',
      defaultOrgUsername: 'fearne-calloway',
    },
    myOrganizations: {
      edges: [{ node: orgList }],
    },
  },
}

const selectedOrgUsername = 'fearne-calloway'

const setSelectedOrgUsername = jest.fn()

const defaultProps = {
  selectedOrgUsername,
  setSelectedOrgUsername,
}

xdescribe('OrganizationList', () => {
  function setup() {
    server.use(
      graphql.query('MyContexts', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(contextData))
      })
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('displays the usernames', async () => {
      render(<OrganizationList {...defaultProps} />, { wrapper })
      const fearneUsername = await screen.findByText(/fearne-calloway/)
      expect(fearneUsername).toBeInTheDocument()
      const morriUsername = await screen.findByText(/morri/)
      expect(morriUsername).toBeInTheDocument()
    })
  })
})
