import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useTreePaths } from './useTreePaths'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const server = setupServer()

const wrapper =
  (initialEntries = ['/gh/owner/coolrepo/tree/main/src%2Ftests']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
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
  owner: { repository: { private: false, defaultBranch: 'main' } },
}

describe('useTreePaths', () => {
  function setup({ repoOverviewData }) {
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(repoOverviewData))
      })
    )
  }
  describe('a path is provided', () => {
    beforeEach(() => {
      setup({
        repoOverviewData: overviewMock,
      })
    })
    describe('no duplicate names in path', () => {
      it('returns a list of objects', () => {
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
        const { result } = renderHook(() => useTreePaths(), {
          wrapper: wrapper([
            '/gh/owner/coolrepo/tree/main/src%2Ftemp%2Fsrc%2Ftemp%2Fcomponent',
          ]),
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
    beforeEach(() => {
      setup({
        repoOverviewData: overviewMock,
      })
    })
    it('returns a list of objects', () => {
      const { result } = renderHook(() => useTreePaths(), {
        wrapper: wrapper(['/gh/owner/coolrepo/tree/main']),
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
    beforeEach(() => {
      setup({
        repoOverviewData: overviewMock,
      })
    })
    describe('a path is provided', () => {
      it('returns a list of objects', async () => {
        const { result } = renderHook(() => useTreePaths(), {
          wrapper: wrapper(['/gh/owner/coolrepo/tree/main/src%2Ffile.js']),
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
    beforeEach(() => {
      setup({
        repoOverviewData: {
          owner: { repository: { private: false, defaultBranch: 'banana' } },
        },
      })
    })

    describe('correctly generates paths', () => {
      it('returns a list of objects', async () => {
        const { result } = renderHook(() => useTreePaths(), {
          wrapper: wrapper(['/gh/owner/coolrepo']),
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
})
