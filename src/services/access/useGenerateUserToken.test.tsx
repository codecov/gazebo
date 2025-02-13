import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { PropsWithChildren } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useGenerateUserToken } from './index'

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  </QueryClientProviderV5>
)

const provider = 'gh'
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

describe('useGenerateUserToken', () => {
  function setup() {
    server.use(
      graphql.mutation(`CreateUserToken`, () => {
        return HttpResponse.json({
          data: {
            createUserToken: {
              error: null,
              fullToken: 'some-token',
            },
          },
        })
      })
    )
  }

  describe('when called', () => {
    describe('when calling the mutation', () => {
      it('returns success', async () => {
        setup()

        const { result } = renderHook(
          () => useGenerateUserToken({ provider }),
          { wrapper }
        )

        result.current.mutate({ name: '1' })

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
      })
    })
  })
})
