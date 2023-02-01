import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useOrganizations } from './useOrganizations'

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/person/repo12']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
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

xdescribe('useOrganizations', () => {
  function setup() {
    server.use(
      graphql.query('MyContexts', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(contextData))
      })
    )
  }

  describe('when calling hook', () => {
    beforeEach(() => setup())

    it('loads initial dataset', async () => {
      renderHook(() => useOrganizations(), {
        wrapper,
      })
      // const expectedData = {
      //   currentUser: {
      //     avatarUrl: '',
      //     username: 'cool-user',
      //   },
      //   myOrganizations: [
      //     {
      //       avatarUrl: '',
      //       username: 'org1',
      //     },
      //   ],
      // }

      // expect(result.current.data).toStrictEqual(expectedData)
    })
  })
})
