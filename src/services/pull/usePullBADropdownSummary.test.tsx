import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { type MockInstance } from 'vitest'

import { usePullBADropdownSummary } from './usePullBADropdownSummary'

const mockPullBASummaryData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        head: { commitid: '2788fb9824b079807f7992f04482450c09774ec7' },
        bundleAnalysisCompareWithBase: {
          __typename: 'BundleAnalysisComparison',
          bundleChange: {
            size: { uncompress: 1 },
            loadTime: { threeG: 2 },
          },
        },
      },
    },
  },
}

const mockNullOwner = {
  owner: null,
}

const mockUnsuccessfulParseError = {}

const mockNotFoundError = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'pull not found',
    },
  },
}

const mockOwnerNotActivatedError = {
  owner: {
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'owner not activated',
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()
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
  isNullOwner?: boolean
  isOwnerNotActivatedError?: boolean
  isNotFoundError?: boolean
}

describe('usePullBADropdownSummary', () => {
  function setup({
    isUnsuccessfulParseError = false,
    isNullOwner = false,
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
  }: SetupArgs = {}) {
    server.use(
      graphql.query('PullBADropdownSummary', () => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        } else {
          return HttpResponse.json({ data: mockPullBASummaryData })
        }
      })
    )
  }

  describe('api returns valid response', () => {
    it('returns pull summary data', async () => {
      setup()
      const { result } = renderHook(
        () =>
          usePullBADropdownSummary({
            provider: 'github',
            owner: 'codecov',
            repo: 'test-repo',
            pullId: 123,
          }),
        { wrapper }
      )

      const expectedResult = {
        pull: {
          head: {
            commitid: '2788fb9824b079807f7992f04482450c09774ec7',
          },
          bundleAnalysisCompareWithBase: {
            __typename: 'BundleAnalysisComparison',
            bundleChange: {
              loadTime: {
                threeG: 2,
              },
              size: {
                uncompress: 1,
              },
            },
          },
        },
      }

      await waitFor(() =>
        expect(result.current.data).toStrictEqual(expectedResult)
      )
    })
  })

  describe('there is a null owner', () => {
    it('returns a null value', async () => {
      setup({ isNullOwner: true })
      const { result } = renderHook(
        () =>
          usePullBADropdownSummary({
            provider: 'github',
            owner: 'codecov',
            repo: 'test-repo',
            pullId: 123,
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({ pull: null })
      )
    })
  })

  describe('unsuccessful parse of zod schema', () => {
    let consoleSpy: MockInstance
    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('throws a 400', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () =>
          usePullBADropdownSummary({
            provider: 'github',
            owner: 'codecov',
            repo: 'test-repo',
            pullId: 123,
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'usePullBADropdownSummary - Parsing Error',
            status: 400,
          })
        )
      )
    })
  })

  describe('returns NotFoundError __typename', () => {
    let consoleSpy: MockInstance
    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('throws a 404', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(
        () =>
          usePullBADropdownSummary({
            provider: 'github',
            owner: 'codecov',
            repo: 'test-repo',
            pullId: 123,
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'usePullBADropdownSummary - Not Found Error',
            status: 404,
          })
        )
      )
    })
  })

  describe('returns OwnerNotActivatedError __typename', () => {
    let consoleSpy: MockInstance
    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('throws a 403', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(
        () =>
          usePullBADropdownSummary({
            provider: 'github',
            owner: 'codecov',
            repo: 'test-repo',
            pullId: 123,
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'usePullBADropdownSummary - Owner Not Activated',
            status: 403,
          })
        )
      )
    })
  })
})
