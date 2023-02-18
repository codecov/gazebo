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

const defaultOrg = {
  username: 'fearne-calloway',
  avatarUrl: 'https://github.com/fearne.png?size=40',
  defaultOrgUsername: null,
}

const orgList = [
  defaultOrg,
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
      edges: [{ node: orgList[0] }, { node: orgList[1] }],
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

      console.log(result.current.organizations)

      expect(result.current.organizations).toEqual([
        {
          username: 'fearne-calloway',
          avatarUrl: 'https://github.com/fearne.png?size=40',
          defaultOrgUsername: null,
        },
        {
          username: 'morrigan',
          avatarUrl: 'https://github.com/morri.png?size=40',
          defaultOrgUsername: 'fearne-calloway',
        },
        {
          username: 'ira-wendagoth',
          avatarUrl: 'https://github.com/fearne.png?size=40',
          defaultOrgUsername: null,
        },
      ])
      expect(result.current.currentUser).toEqual(currentUser)
      expect(result.current.defaultOrg).toEqual(defaultOrg)
    })
  })
})
