import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { MemoryRouter, Route } from 'react-router-dom'

import useSunburstChart from './useSunburstChart'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (
    initialEntries = ['/gh/codecov/cool-repo/tree/main']
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo/tree/:branch">{children}</Route>
          <Route path="/:provider/:owner/:repo">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    </QueryClientProviderV5>
  )

const server = setupServer()
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  vi.clearAllMocks()
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

const treeMock = [
  {
    name: 'repoName',
    fullPath: 'repoName',
    coverage: 100,
    lines: 100,
    hits: 100,
    partials: 0,
    misses: 0,
    children: [],
  },
]

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

interface SetupArgs {
  coverageTreeStatus?: number
}

describe('useSunburstChart', () => {
  const mockDetectedBranch = vi.fn()
  const mockDetectedFlags = vi.fn()
  const mockDetectedComponents = vi.fn()

  function setup({ coverageTreeStatus = 200 }: SetupArgs) {
    server.use(
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({ data: overviewMock })
      }),
      http.get('/internal/:provider/:owner/:repo/coverage/tree', (info) => {
        const searchParams = new URL(info.request.url).searchParams

        mockDetectedBranch(searchParams.get('branch'))
        mockDetectedFlags(searchParams.getAll('flags'))
        mockDetectedComponents(searchParams.get('components'))

        return HttpResponse.json(treeMock, {
          status: coverageTreeStatus,
        })
      })
    )
  }

  describe('successful call', () => {
    it('renders something', async () => {
      setup({ coverageTreeStatus: 200 })
      const { result } = renderHook(() => useSunburstChart(), {
        wrapper: wrapper(),
      })

      await waitFor(() =>
        expect(result.current.data).toMatchObject({
          name: 'cool-repo',
          children: [
            {
              name: 'repoName',
              fullPath: 'repoName',
              coverage: 100,
              lines: 100,
              hits: 100,
              partials: 0,
              misses: 0,
              children: [],
            },
          ],
        })
      )
    })
  })

  describe('unsuccessful call', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error')
    })

    it('returns undefined data if no data is received from the server', async () => {
      setup({ coverageTreeStatus: 500 })
      const { result } = renderHook(() => useSunburstChart(), {
        wrapper: wrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBeTruthy())

      expect(result.current.data).toBeUndefined()
    })
  })

  describe('if no branch provided in url', () => {
    it('query using default branch', async () => {
      setup({ coverageTreeStatus: 200 })
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
    it('query uses current branch', async () => {
      setup({ coverageTreeStatus: 200 })
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
    it('query uses flags and components', async () => {
      setup({ coverageTreeStatus: 200 })
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
