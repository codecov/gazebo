import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { mapEdges } from 'shared/utils/graphql'

import { Session, SessionsQueryOpts, UserToken } from './SessionsQueryOpts'

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
    { node: { lastFour: '1234', type: 'api', name: 'token1', id: 'id-0' } },
    { node: { lastFour: '4254', type: 'api', name: 'token2', id: 'id-1' } },
  ],
}

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  </QueryClientProviderV5>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
  queryClientV5.clear()
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
      graphql.query('MySessions', () => {
        if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: {} })
        }
        return HttpResponse.json({ data: dataReturned })
      })
    )
  }

  describe('when called and response parsing fails', () => {
    it('throws a 404', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () => useQueryV5(SessionsQueryOpts({ provider })),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'SessionsQueryOpts - Parsing Error',
            status: 400,
          })
        )
      )
    })
  })

  describe('when called and user is unauthenticated', () => {
    it('returns null', async () => {
      setup({ dataReturned: { me: null } })
      const { result } = renderHook(
        () => useQueryV5(SessionsQueryOpts({ provider })),
        { wrapper }
      )

      await waitFor(() => expect(result.current.data).toEqual(null))
    })
  })

  describe('when called and user is authenticated', () => {
    it('returns sessions', async () => {
      setup({
        dataReturned: {
          me: {
            sessions: { edges: [...sessions.edges] },
            tokens: { edges: [...tokens.edges] },
          },
        },
      })

      const { result } = renderHook(
        () => useQueryV5(SessionsQueryOpts({ provider })),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data).toEqual({
          sessions: mapEdges(sessions),
          tokens: mapEdges(tokens),
        })
      )
    })
  })
})
