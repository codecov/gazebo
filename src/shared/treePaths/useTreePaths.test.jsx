import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import qs from 'qs'
import { MemoryRouter, Route } from 'react-router-dom'

import { useTreePaths } from './useTreePaths'

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper =
  (initialEntries = '/gh/owner/coolrepo/tree/main/src%2Ftests') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner/:repo">
          <div>{children}</div>
        </Route>
        <Route path="/:provider/:owner/:repo/tree/:branch/:path+">
          <div>{children}</div>
        </Route>
        <Route path="/:provider/:owner/:repo/tree/:branch/:path+">
          <div>{children}</div>
        </Route>
        <Route path="/:provider/:owner/:repo/tree/:branch">
          <div>{children}</div>
        </Route>
        <Route path="/:provider/:owner/:repo/tree/:ref/:path+">
          <div>{children}</div>
        </Route>
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

describe('useTreePaths', () => {
  function setup({ repoOverviewData }) {
    server.use(
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: repoOverviewData })
      })
    )
  }
  describe('a path is provided', () => {
    describe('no duplicate names in path', () => {
      it('returns a list of objects', () => {
        setup({
          repoOverviewData: overviewMock,
        })

        const { result } = renderHook(() => useTreePaths(), {
          wrapper: wrapper(),
        })

        expect(result.current.treePaths).toEqual([
          {
            pageName: 'treeView',
            text: 'coolrepo',
            options: { ref: 'main' },
          },
          {
            options: { tree: 'src', ref: 'main' },
            pageName: 'treeView',
            text: 'src',
          },
          {
            options: { tree: 'src/tests', ref: 'main' },
            pageName: 'treeView',
            text: 'tests',
          },
        ])
      })
    })

    describe('path has duplicate names', () => {
      it('returns a list of objects', () => {
        setup({
          repoOverviewData: overviewMock,
        })

        const { result } = renderHook(() => useTreePaths(), {
          wrapper: wrapper(
            '/gh/owner/coolrepo/tree/main/src%2Ftemp%2Fsrc%2Ftemp%2Fcomponent'
          ),
        })

        expect(result.current.treePaths).toEqual([
          {
            pageName: 'treeView',
            text: 'coolrepo',
            options: { ref: 'main' },
          },
          {
            options: { tree: 'src', ref: 'main' },
            pageName: 'treeView',
            text: 'src',
          },
          {
            options: { tree: 'src/temp', ref: 'main' },
            pageName: 'treeView',
            text: 'temp',
          },
          {
            options: { tree: 'src/temp/src', ref: 'main' },
            pageName: 'treeView',
            text: 'src',
          },
          {
            options: { tree: 'src/temp/src/temp', ref: 'main' },
            pageName: 'treeView',
            text: 'temp',
          },
          {
            options: { tree: 'src/temp/src/temp/component', ref: 'main' },
            pageName: 'treeView',
            text: 'component',
          },
        ])
      })
    })
  })

  describe('no path is given', () => {
    it('returns a list of objects', () => {
      setup({
        repoOverviewData: overviewMock,
      })

      const { result } = renderHook(() => useTreePaths(), {
        wrapper: wrapper('/gh/owner/coolrepo/tree/main'),
      })

      expect(result.current.treePaths).toEqual([
        {
          pageName: 'treeView',
          text: 'coolrepo',
          options: { ref: 'main' },
        },
      ])
    })
  })

  describe('viewing a file', () => {
    describe('a path is provided', () => {
      it('returns a list of objects', async () => {
        setup({
          repoOverviewData: overviewMock,
        })

        const { result } = renderHook(() => useTreePaths(), {
          wrapper: wrapper('/gh/owner/coolrepo/tree/main/src%2Ffile.js'),
        })

        await waitFor(() =>
          expect(result.current.treePaths).toEqual([
            {
              pageName: 'treeView',
              text: 'coolrepo',
              options: { ref: 'main' },
            },
            {
              options: { tree: 'src', ref: 'main' },
              pageName: 'treeView',
              text: 'src',
            },
            {
              options: { tree: 'src/file.js', ref: 'main' },
              pageName: 'treeView',
              text: 'file.js',
            },
          ])
        )
      })
    })
  })

  describe('falls back to default branch', () => {
    describe('correctly generates paths', () => {
      it('returns a list of objects', async () => {
        setup({
          repoOverviewData: {
            owner: {
              isCurrentUserActivated: true,
              repository: {
                __typename: 'Repository',
                private: false,
                defaultBranch: 'banana',
                oldestCommitAt: '2022-10-10T11:59:59',
                coverageEnabled: true,
                bundleAnalysisEnabled: true,
                languages: [],
                testAnalyticsEnabled: false,
              },
            },
          },
        })

        const { result } = renderHook(() => useTreePaths(), {
          wrapper: wrapper('/gh/owner/coolrepo'),
        })

        await waitFor(() =>
          expect(result.current.treePaths).toEqual([
            {
              pageName: 'treeView',
              text: 'coolrepo',
              options: { ref: 'banana' },
            },
          ])
        )
      })
    })
  })

  describe('query string params are passed along', () => {
    it('returns a list of objects with query params in the options', () => {
      setup({
        repoOverviewData: overviewMock,
      })

      const { result } = renderHook(() => useTreePaths(), {
        wrapper: wrapper(
          `/gh/owner/coolrepo/tree/main/src%2Ftests${qs.stringify(
            { flags: ['flag-1'] },
            { addQueryPrefix: true }
          )}`
        ),
      })

      expect(result.current.treePaths).toEqual([
        {
          pageName: 'treeView',
          text: 'coolrepo',
          options: { ref: 'main', queryParams: { flags: ['flag-1'] } },
        },
        {
          options: {
            tree: 'src',
            ref: 'main',
            queryParams: { flags: ['flag-1'] },
          },
          pageName: 'treeView',
          text: 'src',
        },
        {
          options: {
            tree: 'src/tests',
            ref: 'main',
            queryParams: { flags: ['flag-1'] },
          },
          pageName: 'treeView',
          text: 'tests',
        },
      ])
    })
  })
})
