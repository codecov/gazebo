import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { renderHook } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useRepos } from './hooks'
import { MemoryRouter, Route } from 'react-router-dom'
import { mapEdges } from 'shared/utils/graphql'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const provider = 'gh'

const data = {
  me: {
    user: {
      username: 'febg',
    },
    viewableRepositories: {
      totalCount: 80,
      edges: [
        {
          node: {
            name: 'codecov-bash',
            active: true,
            private: false,
            coverage: null,
            updatedAt: '2021-04-22T14:09:39.822872+00:00',
            author: {
              username: 'codecov',
            },
          },
        },
        {
          node: {
            name: 'codecov-circleci-orb',
            active: null,
            private: false,
            coverage: null,
            updatedAt: '2021-04-22T14:09:39.826948+00:00',
            author: {
              username: 'codecov',
            },
          },
        },
      ],
    },
  },
}

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useRepos', () => {
  let hookData

  function setup(dataReturned = null) {
    server.use(
      rest.post(`/graphql/gh`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: dataReturned || data }))
      })
    )
    hookData = renderHook(() => useRepos({ provider }), {
      wrapper,
    })
  }

  describe('when called and user is authenticated', () => {
    beforeEach(() => {
      setup()
      return hookData.waitFor(() => hookData.result.current.isSuccess)
    })

    it('returns active repositories', () => {
      const _data = mapEdges(data.me.viewableRepositories)
      expect(hookData.result.current.data).toEqual({
        active: _data.filter((d) => d.active === true),
        inactive: _data.filter((d) => d.active !== true),
      })
    })
  })
})
