import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { mapEdges } from 'shared/utils/graphql'

import { Session, UserToken, useSessions } from './useSessions'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const provider = 'gh'

const sessions: { edges: { node: Session }[] } = {
  edges: [
    {
      node: {
        sessionid: 32,
        ip: '172.21.0.1',
        lastseen: '2021-04-19T18:35:05.451136Z',
        useragent: null,
        type: 'login',
        name: null,
        lastFour: '00ff',
      },
    },
    {
      node: {
        sessionid: 6,
        ip: '172.23.0.2',
        lastseen: '2020-07-29T18:36:06.443999Z',
        useragent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36',
        type: 'login',
        name: null,
        lastFour: '0100',
      },
    },
  ],
}

const tokens: { edges: { node: UserToken }[] } = {
  edges: [
    {
      node: {
        lastFour: '1234',
        type: 'api',
        name: 'token1',
        id: 'id-0',
      },
    },
    {
      node: {
        lastFour: '4254',
        type: 'api',
        name: 'token2',
        id: 'id-1',
      },
    },
  ],
}

const server = setupServer()
beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  isUnsuccessfulParseError?: boolean
  dataReturned?: {
    me: {
      sessions: {
        edges: {
          node: Session
        }[]
      }
      tokens: {
        edges: {
          node: UserToken
        }[]
      }
    } | null
  }
}

describe('useSessions', () => {
  function setup({
    isUnsuccessfulParseError = false,
    dataReturned = { me: null },
  }: SetupArgs) {
    server.use(
      graphql.query('MySessions', (info) => {
        if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: {} })
        }
        return HttpResponse.json({ data: dataReturned })
      })
    )
  }

  describe('when called and response parsing fails', () => {
    beforeEach(() => {
      setup({ isUnsuccessfulParseError: true })
    })

    it('throws a 404', async () => {
      const { result } = renderHook(() => useSessions({ provider }), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'useSessions - 404 schema parsing failed',
          })
        )
      )
    })
  })

  describe('when called and user is unauthenticated', () => {
    beforeEach(() => {
      setup({
        dataReturned: {
          me: null,
        },
      })
    })

    it('returns null', async () => {
      const { result } = renderHook(() => useSessions({ provider }), {
        wrapper,
      })

      await waitFor(() => expect(result.current.data).toEqual(null))
    })
  })

  describe('when called and user is authenticated', () => {
    beforeEach(() => {
      setup({
        dataReturned: {
          me: {
            sessions: {
              edges: [...sessions.edges],
            },
            tokens: {
              edges: [...tokens.edges],
            },
          },
        },
      })
    })

    it('returns sessions', async () => {
      const { result } = renderHook(() => useSessions({ provider }), {
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
