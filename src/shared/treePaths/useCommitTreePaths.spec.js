import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter, Route } from 'react-router-dom'

import { useCommitTreePaths } from './useCommitTreePath'

describe('useCommitTreePaths', () => {
  describe('a path is provided', () => {
    describe('no duplicate names in path', () => {
      const wrapper = ({ children }) => (
        <MemoryRouter
          initialEntries={['/gh/owner/cool-repo/commit/sha256/tree/src/tests']}
        >
          <Route path="/:provider/:owner/:repo/commit/:commit/tree/:path+">
            <div>{children}</div>
          </Route>
        </MemoryRouter>
      )

      it('returns a list of objects', () => {
        const { result } = renderHook(() => useCommitTreePaths(), {
          wrapper,
        })

        expect(result.current.treePaths).toEqual([
          {
            pageName: 'commitTreeView',
            text: 'cool-repo',
            options: { commitSha: 'sha256' },
          },
          {
            options: { dirPath: 'src', commitSha: 'sha256' },
            pageName: 'commitTreeView',
            text: 'src',
          },
          {
            options: { dirPath: 'src/tests', commitSha: 'sha256' },
            pageName: 'commitTreeView',
            text: 'tests',
          },
        ])
      })
    })
    describe('path has duplicate names', () => {
      const wrapper = ({ children }) => (
        <MemoryRouter
          initialEntries={[
            '/gh/owner/cool-repo/commit/sha256/tree/src/temp/src/temp/component',
          ]}
        >
          <Route path="/:provider/:owner/:repo/commit/:commit/tree/:path+">
            <div>{children}</div>
          </Route>
        </MemoryRouter>
      )

      it('returns a list of objects', () => {
        const { result } = renderHook(() => useCommitTreePaths(), { wrapper })

        expect(result.current.treePaths).toEqual([
          {
            pageName: 'commitTreeView',
            text: 'cool-repo',
            options: { commitSha: 'sha256' },
          },
          {
            options: { dirPath: 'src', commitSha: 'sha256' },
            pageName: 'commitTreeView',
            text: 'src',
          },
          {
            options: { dirPath: 'src/temp', commitSha: 'sha256' },
            pageName: 'commitTreeView',
            text: 'temp',
          },
          {
            options: { dirPath: 'src/temp/src', commitSha: 'sha256' },
            pageName: 'commitTreeView',
            text: 'src',
          },
          {
            options: { dirPath: 'src/temp/src/temp', commitSha: 'sha256' },
            pageName: 'commitTreeView',
            text: 'temp',
          },
          {
            options: {
              dirPath: 'src/temp/src/temp/component',
              commitSha: 'sha256',
            },
            pageName: 'commitTreeView',
            text: 'component',
          },
        ])
      })
    })
  })

  describe('no path is given', () => {
    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/gh/owner/cool-repo/commit/sha256/tree']}>
        <Route path="/:provider/:owner/:repo/commit/:commit/tree/">
          <div>{children}</div>
        </Route>
      </MemoryRouter>
    )

    it('returns a list of objects', () => {
      const { result } = renderHook(() => useCommitTreePaths(), { wrapper })

      expect(result.current.treePaths).toEqual([
        {
          pageName: 'commitTreeView',
          text: 'cool-repo',
          options: { commitSha: 'sha256' },
        },
      ])
    })
  })

  describe('viewing a file', () => {
    describe('a path is provided', () => {
      const wrapper = ({ children }) => (
        <MemoryRouter
          initialEntries={[
            '/gh/owner/cool-repo/commit/sha256/tree/src/file.js',
          ]}
        >
          <Route path="/:provider/:owner/:repo/commit/:commit/tree/:path+">
            <div>{children}</div>
          </Route>
        </MemoryRouter>
      )

      it('returns a list of objects', () => {
        const { result } = renderHook(() => useCommitTreePaths(), { wrapper })

        expect(result.current.treePaths).toEqual([
          {
            pageName: 'commitTreeView',
            text: 'cool-repo',
            options: { commitSha: 'sha256' },
          },
          {
            options: { dirPath: 'src', commitSha: 'sha256' },
            pageName: 'commitTreeView',
            text: 'src',
          },
          {
            options: { dirPath: 'src/file.js', commitSha: 'sha256' },
            pageName: 'commitTreeView',
            text: 'file.js',
          },
        ])
      })
    })
  })
})
