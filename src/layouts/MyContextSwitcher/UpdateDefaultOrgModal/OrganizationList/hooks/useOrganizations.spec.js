import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useOrganizations } from './useOrganizations'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

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

const currentUser = {
  username: 'morrigan',
  avatarUrl: 'https://github.com/morri.png?size=40',
  defaultOrgUsername: 'fearne-calloway',
}

const contextData = {
  me: {
    owner: currentUser,
    myOrganizations: {
      edges: [{ node: orgList }],
    },
  },
}

describe('useOrganizations', () => {
  function setup() {
    server.use(
      graphql.query('MyContexts', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(contextData))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns data for the organization list component', async () => {
      const { result, waitFor } = renderHook(() => useOrganizations(), {
        wrapper,
      })

      await waitFor(() => result.current.isSuccess)

      expect(result.current.organizations).toEqual([
        {
          ...currentUser,
        },
        {
          ...orgList,
        },
      ])
      expect(result.current.currentUser).toEqual(currentUser)
    })
  })
})
