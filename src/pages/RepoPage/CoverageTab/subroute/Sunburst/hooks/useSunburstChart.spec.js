import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
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
  ({ children }) =>
    (
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
    },
  },
}

describe('useSunburstChart', () => {
  const mockDetectedBranch = jest.fn()
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

      await waitFor(() => expect(mockDetectedBranch).toBeCalled())
      await waitFor(() => expect(mockDetectedBranch).toBeCalledWith('main'))
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

      await waitFor(() => expect(mockDetectedBranch).toBeCalled())
      await waitFor(() =>
        expect(mockDetectedBranch).toBeCalledWith('something')
      )
    })
  })
})
