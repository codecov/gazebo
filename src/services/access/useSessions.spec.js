import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { mapEdges } from 'shared/utils/graphql'

import { useSessions } from './useSessions'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const provider = 'gh'

const sessions = {
  edges: [
    {
      node: {
        sessionid: 32,
        ip: '172.21.0.1',
        lastseen: '2021-04-19T18:35:05.451136Z',
        useragent: null,
        owner: 2,
        type: 'login',
        name: null,
      },
    },
    {
      node: {
        sessionid: 6,
        ip: '172.23.0.2',
        lastseen: '2020-07-29T18:36:06.443999Z',
        useragent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36',
        owner: 2,
        type: 'login',
        name: null,
      },
    },
  ],
}

const tokens = {
  edges: [
    {
      node: {
        lastFour: '1234',
        owner: 2,
        type: 'api',
        name: 'token1',
      },
    },
    {
      node: {
        lastFour: '4254',
        owner: 2,
        type: 'api',
        name: 'token2',
      },
    },
  ],
}

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useSessions', () => {
  function setup(dataReturned) {
    server.use(
      rest.post(`/graphql/gh`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: dataReturned }))
      })
    )
  }

  describe('when called and user is unauthenticated', () => {
    beforeEach(() => {
      setup({
        me: null,
      })
    })

    describe('when data is loaded', () => {
      it('returns null', async () => {
        const { result, waitFor } = renderHook(
          () => useSessions({ provider }),
          {
            wrapper,
          }
        )

        await waitFor(() => expect(result.current.data).toEqual(null))
      })
    })
  })

  describe('when called and user is authenticated', () => {
    beforeEach(() => {
      setup({
        me: {
          sessions: {
            edges: [...sessions.edges],
          },
          tokens: {
            edges: [...tokens.edges],
          },
        },
      })
    })

    it('returns sessions', async () => {
      const { result, waitFor } = renderHook(() => useSessions({ provider }), {
        wrapper,
      })

      await waitFor(() =>
        expect(result.current.data).toEqual({
          sessions: mapEdges(sessions),
          tokens: mapEdges(tokens),
        })
      )
    })
  })
})
