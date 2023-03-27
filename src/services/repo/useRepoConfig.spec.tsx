import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import type { ReactNode } from 'react'

import { useRepoConfig } from './useRepoConfig'

const mockRepoConfig = {
  owner: {
    repository: {
      repositoryConfig: {
        indicationRange: {
          lowerRange: 60,
          upperRange: 80,
        },
      },
    },
  },
}

const queryClient = new QueryClient()
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

describe('useRepoConfig', () => {
  function setup() {
    server.use(
      graphql.query('RepoConfig', (_, res, ctx) =>
        res(ctx.status(200), ctx.data(mockRepoConfig))
      )
    )
  }

  describe('calling hook', () => {
    beforeEach(() => setup())

    describe('no options are passed', () => {
      it('returns the repository config', async () => {
        const { result, waitFor } = renderHook(
          () =>
            useRepoConfig({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
            }),
          { wrapper }
        )

        await waitFor(() => result.current.isSuccess)

        expect(result.current.data).toStrictEqual({
          indicationRange: { lowerRange: 60, upperRange: 80 },
        })
      })
    })

    describe('options are passed', () => {
      it('returns the repository config', async () => {
        const { result, waitFor } = renderHook(
          () =>
            useRepoConfig({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              opts: {
                onSuccess: () => {},
              },
            }),
          { wrapper }
        )

        await waitFor(() => result.current.isSuccess)

        expect(result.current.data).toStrictEqual({
          indicationRange: { lowerRange: 60, upperRange: 80 },
        })
      })
    })
  })
})
