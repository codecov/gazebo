import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useTabsCounts } from './useTabsCounts'

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
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
              isCached: false,
            },
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
          bundleAnalysis: {
            bundleAnalysisReport: null,
          },
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

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/bb/critical-role/bells-hells/pull/9') =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
      </MemoryRouter>
    </QueryClientProviderV5>
  )

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('useTabsCount', () => {
  function setup({ firstPullRequest = false }) {
    server.use(
      graphql.query('PullPageData', () => {
        if (firstPullRequest) {
          return HttpResponse.json({ data: mockFirstPullData })
        }
        return HttpResponse.json({ data: mockPullData })
      })
    )
  }

  describe('calling hook', () => {
    it('returns the correct data', async () => {
      setup({})
      const { result } = renderHook(() => useTabsCounts(), {
        wrapper: wrapper(),
      })

      await waitFor(() => queryClientV5.isFetching)
      await waitFor(() => !queryClientV5.isFetching)

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
    it('returns 0s for comparison data', async () => {
      setup({ firstPullRequest: true })
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
      setup({})
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
