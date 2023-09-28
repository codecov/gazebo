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
  function setup() {
    server.use(
      graphql.query('OwnerTier', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockOwnerTier))
      })
    )
  }

  describe('calling hook', () => {
    beforeEach(() => setup())
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
})
