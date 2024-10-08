import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'

import { useInfiniteTestResults } from './useInfiniteTestResults'

const mockTestResults = {
  owner: {
    repository: {
      __typename: 'Repository',
      testResults: {
        edges: [
          {
            node: {
              updatedAt: '2023-01-01T00:00:00Z',
              name: 'test-1',
              commitsFailed: 1,
              failureRate: 0.1,
              flakeRate: 0.0,
              avgDuration: 10,
            },
          },
          {
            node: {
              updatedAt: '2023-01-02T00:00:00Z',
              name: 'test-2',
              commitsFailed: 2,
              failureRate: 0.2,
              flakeRate: 0.0,
              avgDuration: 20,
            },
          },
          {
            node: {
              updatedAt: '2023-01-03T00:00:00Z',
              name: 'test-3',
              commitsFailed: 3,
              failureRate: 0.2,
              flakeRate: 0.1,
              avgDuration: 30,
            },
          },
        ],
        pageInfo: {
          endCursor: 'cursor-2',
          hasNextPage: true,
        },
      },
    },
  },
}

const mockNotFoundError = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'Repository not found',
    },
  },
}

const mockOwnerNotActivatedError = {
  owner: {
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'Owner not activated',
    },
  },
}

const mockNullOwner = {
  owner: null,
}

const mockUnsuccessfulParseError = {}

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

interface SetupArgs {
  isNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
}

describe('useInfiniteTestResults', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetTestResults', (info) => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        } else {
          return HttpResponse.json({ data: mockTestResults })
        }
      })
    )
  }

  describe('calling hook', () => {
    describe('returns repository typename of Repository', () => {
      describe('there is valid data', () => {
        it('fetches the test results data', async () => {
          setup({})
          const { result } = renderHook(
            () =>
              useInfiniteTestResults({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                filters: { branch: 'main' },
              }),
            { wrapper }
          )

          await waitFor(() =>
            expect(result.current.data.testResults).toStrictEqual([
              {
                updatedAt: '2023-01-01T00:00:00Z',
                name: 'test-1',
                commitsFailed: 1,
                failureRate: 0.1,
                flakeRate: 0.0,
                avgDuration: 10,
              },
              {
                updatedAt: '2023-01-02T00:00:00Z',
                name: 'test-2',
                commitsFailed: 2,
                failureRate: 0.2,
                flakeRate: 0.0,
                avgDuration: 20,
              },
              {
                updatedAt: '2023-01-03T00:00:00Z',
                name: 'test-3',
                commitsFailed: 3,
                failureRate: 0.2,
                flakeRate: 0.1,
                avgDuration: 30,
              },
            ])
          )
        })
      })

      describe('there is a null owner', () => {
        it('returns an empty array', async () => {
          setup({ isNullOwner: true })
          const { result } = renderHook(
            () =>
              useInfiniteTestResults({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                filters: { branch: 'main' },
              }),
            { wrapper }
          )

          await waitFor(() =>
            expect(result.current.data.testResults).toStrictEqual([])
          )
        })
      })
    })

    describe('returns NotFoundError __typename', () => {
      let oldConsoleError = console.error

      beforeEach(() => {
        console.error = () => null
      })

      afterEach(() => {
        console.error = oldConsoleError
      })

      it('throws a 404', async () => {
        setup({ isNotFoundError: true })
        const { result } = renderHook(
          () =>
            useInfiniteTestResults({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              filters: { branch: 'main' },
            }),
          { wrapper }
        )

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 404,
              dev: 'useInfiniteTestResults - 404 Not found error',
            })
          )
        )
      })
    })

    describe('returns OwnerNotActivatedError __typename', () => {
      let oldConsoleError = console.error

      beforeEach(() => {
        console.error = () => null
      })

      afterEach(() => {
        console.error = oldConsoleError
      })

      it('throws a 403', async () => {
        setup({ isOwnerNotActivatedError: true })
        const { result } = renderHook(
          () =>
            useInfiniteTestResults({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              filters: { branch: 'main' },
            }),
          { wrapper }
        )

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 403,
              dev: 'useInfiniteTestResults - 403 Owner not activated',
            })
          )
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
            useInfiniteTestResults({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              filters: { branch: 'main' },
            }),
          { wrapper }
        )

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 404,
              dev: 'useInfiniteTestResults - 404 Failed to parse data',
            })
          )
        )
      })
    })
  })
})
