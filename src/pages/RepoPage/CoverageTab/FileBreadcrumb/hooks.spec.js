import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter, Route } from 'react-router-dom'

import { useTreePaths } from './hooks'

describe('useTreePaths', () => {
  let hookData

  describe('a path is provided', () => {
    describe('no duplicate names in path', () => {
      const wrapper = ({ children }) => (
        <MemoryRouter
          initialEntries={['/gh/owner/coolrepo/tree/main/src/tests']}
        >
          <Route path="/:provider/:owner/:repo/tree/:branch/:path+">
            <div>{children}</div>
          </Route>
        </MemoryRouter>
      )
      function setup() {
        hookData = renderHook(() => useTreePaths(), { wrapper })
      }

      beforeEach(() => {
        setup()
        return hookData.waitFor(() => hookData.result)
      })

      it('returns a list of objects', () => {
        expect(hookData.result.current.treePaths).toEqual([
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
      const wrapper = ({ children }) => (
        <MemoryRouter
          initialEntries={[
            '/gh/owner/coolrepo/tree/main/src/temp/src/temp/component',
          ]}
        >
          <Route path="/:provider/:owner/:repo/tree/:branch/:path+">
            <div>{children}</div>
          </Route>
        </MemoryRouter>
      )
      function setup() {
        hookData = renderHook(() => useTreePaths(), { wrapper })
      }

      beforeEach(() => {
        setup()
        return hookData.waitFor(() => hookData.result)
      })

      it('returns a list of objects', () => {
        expect(hookData.result.current.treePaths).toEqual([
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
    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/gh/owner/coolrepo/tree/main']}>
        <Route path="/:provider/:owner/:repo/tree/:branch">
          <div>{children}</div>
        </Route>
      </MemoryRouter>
    )
    function setup() {
      hookData = renderHook(() => useTreePaths(), { wrapper })
    }

    beforeEach(() => {
      setup()
      return hookData.waitFor(() => hookData.result)
    })

    it('returns a list of objects', () => {
      expect(hookData.result.current.treePaths).toEqual([
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
      const wrapper = ({ children }) => (
        <MemoryRouter
          initialEntries={['/gh/owner/coolrepo/tree/main/src/file.js']}
        >
          <Route path="/:provider/:owner/:repo/tree/:ref/:path+">
            <div>{children}</div>
          </Route>
        </MemoryRouter>
      )
      function setup() {
        hookData = renderHook(() => useTreePaths(), { wrapper })
      }

      beforeEach(() => {
        setup()
        return hookData.waitFor(() => hookData.result)
      })

      it('returns a list of objects', () => {
        expect(hookData.result.current.treePaths).toEqual([
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
