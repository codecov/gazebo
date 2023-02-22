import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter, Route } from 'react-router-dom'

import { useTreePaths } from './useTreePaths'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper =
  (initialEntries = ['/gh/owner/coolrepo/tree/main/src/tests']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
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

describe('useTreePaths', () => {
  describe('a path is provided', () => {
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
            '/gh/owner/coolrepo/tree/main/src/temp/src/temp/component',
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
    describe('a path is provided', () => {
      it('returns a list of objects', () => {
        const { result } = renderHook(() => useTreePaths(), {
          wrapper: wrapper(['/gh/owner/coolrepo/tree/main/src/file.js']),
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
            options: { tree: 'src/file.js', ref: 'main' },
            pageName: 'treeView',
            text: 'file.js',
          },
        ])
      })
    })
  })
})
