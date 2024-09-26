import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useTabsCounts } from './useTabsCounts'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/bb/critical-role/bells-hells/pull/9') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

const mockPullData = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      pull: {
        pullId: 1,
        commits: {
          totalCount: 11,
        },
        head: {
          commitid: '123',
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
          },
        },
        compareWithBase: {
          __typename: 'Comparison',
          componentComparisonsCount: 6,
          directChangedFilesCount: 4,
          flagComparisonsCount: 1,
          indirectChangedFilesCount: 0,
          impactedFilesCount: 0,
        },
        bundleAnalysisCompareWithBase: {
          __typename: 'BundleAnalysisComparison',
        },
      },
    },
  },
}

const mockFirstPullData = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      coverageEnabled: true,
      bundleAnalysisEnabled: false,
      pull: {
        pullId: 1,
        commits: {
          totalCount: 11,
        },
        head: {
          commitid: '123',
          bundleAnalysisReport: null,
        },
        compareWithBase: {
          __typename: 'FirstPullRequest',
          message: 'First pull request',
        },
        bundleAnalysisCompareWithBase: null,
      },
    },
  },
}

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

describe('useTabsCount', () => {
  function setup({ firstPullRequest = false }) {
    server.use(
      graphql.query('PullPageData', (info) => {
        if (firstPullRequest) {
          return HttpResponse.json({ data: mockFirstPullData })
        }
        return HttpResponse.json({ data: mockPullData })
      })
    )
  }

  describe('calling hook', () => {
    beforeEach(() => {
      setup({})
    })

    it('returns the correct data', async () => {
      const { result } = renderHook(() => useTabsCounts(), {
        wrapper: wrapper(),
      })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      await waitFor(() =>
        expect(result.current).toStrictEqual({
          flagsCount: 1,
          componentsCount: 6,
          directChangedFilesCount: 4,
          indirectChangesCount: 0,
          commitsCount: 11,
        })
      )
    })
  })

  describe('first pull request', () => {
    beforeEach(() => {
      setup({ firstPullRequest: true })
    })

    it('returns 0s for comparison data', async () => {
      const { result } = renderHook(() => useTabsCounts(), {
        wrapper: wrapper(),
      })

      await waitFor(() =>
        expect(result.current).toStrictEqual({
          flagsCount: 0,
          componentsCount: 0,
          directChangedFilesCount: 0,
          indirectChangesCount: 0,
          commitsCount: 11,
        })
      )
    })
  })

  describe('when usePullPageData is loading', () => {
    it('should return 0s for tab counts', async () => {
      const { result } = renderHook(() => useTabsCounts(), {
        wrapper: wrapper(),
      })

      await waitFor(() =>
        expect(result.current).toStrictEqual({
          flagsCount: 0,
          componentsCount: 0,
          directChangedFilesCount: 0,
          indirectChangesCount: 0,
          commitsCount: 0,
        })
      )
    })
  })
})
