import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useOwnerRateLimitStatus } from './useOwnerRateLimitStatus'

const mockRateLimitStatus = {
  me: {
    owner: {
      isGithubRateLimited: true,
    },
  },
}

const mockUnsuccessfulParseError = {
  owner: {
    wrong: 'schema',
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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

interface SetupArgs {
  isUnsuccessfulParseError?: boolean
}

describe('useOwnerRateLimitStatus', () => {
  function setup({ isUnsuccessfulParseError = false }: SetupArgs) {
    server.use(
      graphql.query('GetOwnerRateLimitStatus', (req, res, ctx) => {
        if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        }
        return res(ctx.status(200), ctx.data(mockRateLimitStatus))
      })
    )
  }

  describe('there is valid data', () => {
    it('fetches the owner rate limit status', async () => {
      setup({})
      const { result } = renderHook(
        () =>
          useOwnerRateLimitStatus({
            provider: 'gh',
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          isGithubRateLimited: true,
        })
      )
    })
  })

  describe('unsuccessful parse of zod schema', () => {
    let oldConsoleError = console.error

    beforeEach(() => {
      console.error = () => null
    })

    afterEach(() => {
      console.error = oldConsoleError
    })

    it('throws a 404', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () =>
          useOwnerRateLimitStatus({
            provider: 'gh',
          }),
        { wrapper }
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
