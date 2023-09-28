import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import type { ReactNode } from 'react'

import { useTier } from './useTier'

const mockOwnerTier = {
  owner: {
    plan: {
      tierName: 'pro',
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const mockUnsuccessfulParseError = {}

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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

describe('useTier', () => {
  function setup({ isUnsuccessfulParseError = false }) {
    server.use(
      graphql.query('OwnerTier', (req, res, ctx) => {
        if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else {
          return res(ctx.status(200), ctx.data(mockOwnerTier))
        }
      })
    )
  }

  describe('when useTier is called', () => {
    describe('api returns valid response', () => {
      beforeEach(() => {
        setup({})
      })
      it('returns the owners tier', async () => {
        const { result } = renderHook(
          () =>
            useTier({
              provider: 'gh',
              owner: 'codecov',
            }),
          { wrapper }
        )
        await waitFor(() => result.current.isSuccess)
        await waitFor(() => expect(result.current.data).toEqual('pro'))
      })
    })

    describe('unsuccessful parse of zod schema', () => {
      beforeEach(() => {
        jest.spyOn(console, 'error')
      })

      afterEach(() => {
        jest.resetAllMocks()
      })

      it('throws a 404', async () => {
        setup({ isUnsuccessfulParseError: true })
        const { result } = renderHook(
          () =>
            useTier({
              provider: 'gh',
              owner: 'codecov',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 404,
            })
          )
        )
      })
    })
  })
})
