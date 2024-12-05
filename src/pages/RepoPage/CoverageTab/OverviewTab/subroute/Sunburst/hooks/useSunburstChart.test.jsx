import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { MemoryRouter, Route } from 'react-router-dom'

import useSunburstChart from './useSunburstChart'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const server = setupServer()

const wrapper =
  (initialEntries = ['/gh/codecov/cool-repo/tree/main']) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/tree/:branch">{children}</Route>
        <Route path="/:provider/:owner/:repo">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

const treeMock = { name: 'repoName', children: [] }
const overviewMock = {
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      languages: [],
      testAnalyticsEnabled: false,
    },
  },
}

describe('useSunburstChart', () => {
  const mockDetectedBranch = vi.fn()
  const mockDetectedFlags = vi.fn()
  const mockDetectedComponents = vi.fn()

  function setup({
    repoOverviewData,
    coverageTreeRes,
    coverageTreeStatus = 200,
  }) {
    server.use(
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({ data: repoOverviewData })
      }),
      http.get('/internal/:provider/:owner/:repo/coverage/tree', (info) => {
        const searchParams = new URL(info.request.url).searchParams

        mockDetectedBranch(searchParams.get('branch'))
        mockDetectedFlags(searchParams.getAll('flags'))
        mockDetectedComponents(searchParams.get('components'))

        return HttpResponse.json(
          { data: coverageTreeRes },
          { status: coverageTreeStatus }
        )
      })
    )
  }

  describe('successful call', () => {
    beforeEach(() => {
      setup({
        repoOverviewData: overviewMock,
        coverageTreeRes: treeMock,
        coverageTreeStatus: 200,
      })
    })

    it('renders something', async () => {
      const { result } = renderHook(() => useSunburstChart(), {
        wrapper: wrapper(),
      })

      await waitFor(() =>
        expect(result.current.data).toMatchObject({
          name: 'cool-repo',
          children: { data: { name: 'repoName', children: [] } },
        })
      )
    })
  })

  describe('unsuccessful call', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error')
      setup({
        repoOverviewData: overviewMock,
        coverageTreeStatus: 500,
      })
    })
    afterEach(() => vi.clearAllMocks())

    it('returns undefined data if no data is received from the server', async () => {
      const { result } = renderHook(() => useSunburstChart(), {
        wrapper: wrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBeTruthy())

      expect(result.current.data).toBeUndefined()
    })
  })

  describe('if no branch provided in url', () => {
    beforeEach(() => {
      setup({
        repoOverviewData: overviewMock,
        coverageTreeRes: treeMock,
        coverageTreeStatus: 200,
      })
    })
    afterEach(() => vi.clearAllMocks())

    it('query using default branch', async () => {
      renderHook(() => useSunburstChart(), {
        wrapper: wrapper(['/critical-role/c3/bells-hells']),
      })

      await waitFor(() => expect(mockDetectedBranch).toHaveBeenCalled())
      await waitFor(() =>
        expect(mockDetectedBranch).toHaveBeenCalledWith('main')
      )
    })
  })

  describe('if branch is in the url', () => {
    beforeEach(() => {
      setup({
        repoOverviewData: overviewMock,
        coverageTreeRes: treeMock,
        coverageTreeStatus: 200,
      })
    })
    afterEach(() => vi.clearAllMocks())

    it('query uses current branch', async () => {
      renderHook(() => useSunburstChart(), {
        wrapper: wrapper(['/critical-role/c3/bells-hells/tree/something']),
      })

      await waitFor(() => expect(mockDetectedBranch).toHaveBeenCalled())
      await waitFor(() =>
        expect(mockDetectedBranch).toHaveBeenCalledWith('something')
      )
    })
  })

  describe('if flags and components are in the url', () => {
    beforeEach(() => {
      setup({
        repoOverviewData: overviewMock,
        coverageTreeRes: treeMock,
        coverageTreeStatus: 200,
      })
    })
    afterEach(() => vi.clearAllMocks())

    it('query uses flags and components', async () => {
      const queryString = qs.stringify(
        { flags: ['flag-1', 'flag-2'], components: ['components-1'] },
        { addQueryPrefix: true }
      )
      renderHook(() => useSunburstChart(), {
        wrapper: wrapper([`/critical-role/c3/bells-hells${queryString}`]),
      })

      await waitFor(() =>
        expect(mockDetectedFlags).toHaveBeenCalledWith(['flag-1', 'flag-2'])
      )
      await waitFor(() =>
        expect(mockDetectedComponents).toHaveBeenCalledWith('components-1')
      )
    })
  })
})
