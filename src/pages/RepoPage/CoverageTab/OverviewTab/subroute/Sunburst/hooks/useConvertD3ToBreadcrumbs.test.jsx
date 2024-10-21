import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import useConvertD3ToBreadcrumbs from './useConvertD3ToBreadcrumbs'

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
        <Route path="/:provider/:owner/:repo/tree/:branch/:path+">
          {children}
        </Route>
        <Route path="/:provider/:owner/:repo/tree/:branch">{children}</Route>
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

describe('useConvertD3ToBreadcrumbs', () => {
  function setup({ repoOverviewData }) {
    server.use(
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: repoOverviewData })
      })
    )
  }

  describe('generates breadcrumb data', () => {
    beforeEach(() => {
      setup({
        repoOverviewData: overviewMock,
      })
    })

    it('returns the repo when no path set', () => {
      const { result } = renderHook(() => useConvertD3ToBreadcrumbs(), {
        wrapper: wrapper(),
      })

      expect(result.current).toMatchObject([
        { pageName: 'repo', text: 'cool-repo' },
      ])
    })

    it('generates the path and links to file', () => {
      const { result } = renderHook(
        () =>
          useConvertD3ToBreadcrumbs({
            path: 'main/bells-hells/imogen.js',
            type: 'file',
          }),
        {
          wrapper: wrapper([
            '/gh/critical-role/c3/tree/main/bells-hells/imogen.js',
          ]),
        }
      )

      expect(result.current).toMatchObject([
        {
          pageName: 'fileViewer',
          text: 'imogen.js',
          options: { tree: 'main/bells-hells/imogen.js', ref: 'main' },
        },
        {
          pageName: 'treeView',
          text: 'bells-hells',
          options: { tree: 'main/bells-hells', ref: 'main' },
        },
        {
          pageName: 'treeView',
          text: 'main',
          options: { tree: 'main', ref: 'main' },
        },
        { pageName: 'treeView', text: 'c3', options: { ref: 'main' } },
      ])
    })

    it('generates the path and links to a folder', () => {
      const { result } = renderHook(
        () =>
          useConvertD3ToBreadcrumbs({
            path: 'main/bells-hells/fey-realm',
            type: 'folder',
          }),
        {
          wrapper: wrapper([
            '/gh/critical-role/c3/tree/main/bells-hells/fey-realm',
          ]),
        }
      )

      expect(result.current).toMatchObject([
        {
          pageName: 'treeView',
          text: 'fey-realm',
          options: { tree: 'main/bells-hells/fey-realm', ref: 'main' },
        },
        {
          pageName: 'treeView',
          text: 'bells-hells',
          options: { tree: 'main/bells-hells', ref: 'main' },
        },
        {
          pageName: 'treeView',
          text: 'main',
          options: { tree: 'main', ref: 'main' },
        },
        { pageName: 'treeView', text: 'c3', options: { ref: 'main' } },
      ])
    })
  })
})
