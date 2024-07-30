import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, rest } from 'msw'
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
  const mockDetectedBranch = jest.fn()
  const mockDetectedFlags = jest.fn()
  const mockDetectedComponents = jest.fn()

  function setup({
    repoOverviewData,
    coverageTreeRes,
    coverageTreeStatus = 200,
  }) {
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(repoOverviewData))
      }),
      rest.get(
        '/internal/:provider/:owner/:repo/coverage/tree',
        (req, res, ctx) => {
          mockDetectedBranch(req.url.searchParams.get('branch'))
          mockDetectedFlags(req.url.searchParams.getAll('flags'))
          mockDetectedComponents(req.url.searchParams.get('components'))

          return res(
            ctx.status(coverageTreeStatus),
            ctx.json({ data: coverageTreeRes })
          )
        }
      )
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
      jest.spyOn(console, 'error')
      setup({
        repoOverviewData: overviewMock,
        coverageTreeStatus: 500,
      })
    })
    afterEach(() => jest.resetAllMocks())

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
    afterEach(() => jest.resetAllMocks())

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
    afterEach(() => jest.resetAllMocks())

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
    afterEach(() => jest.resetAllMocks())

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
