import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'

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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

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

describe('useRepoConfig', () => {
  function setup() {
    server.use(
      graphql.query('RepoConfig', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoConfig))
      })
    )
  }

  describe('calling hook', () => {
    beforeEach(() => setup())

    describe('no options are passed', () => {
      it('returns the repository config', async () => {
        const { result } = renderHook(
          () =>
            useRepoConfig({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
            }),
          { wrapper }
        )

        await waitFor(() => result.current.isSuccess)

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            indicationRange: { lowerRange: 60, upperRange: 80 },
          })
        )
      })
    })

    describe('options are passed', () => {
      it('returns the repository config', async () => {
        const { result } = renderHook(
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

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            indicationRange: { lowerRange: 60, upperRange: 80 },
          })
        )
      })
    })
  })
})
