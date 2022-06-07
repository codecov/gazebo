const { renderHook } = require('@testing-library/react-hooks')
const { Route } = require('react-router-dom')
const { MemoryRouter } = require('react-router-dom')

const { useTreePaths } = require('./hooks')

describe('useTreePaths', () => {
  let hookData

  describe('a path is provided', () => {
    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/gh/owner/coolrepo/tree/src/tests']}>
        <Route path="/:provider/:owner/:repo/tree/:path+">
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
          options: { tree: 'coolrepo' },
          pageName: 'treeView',
          text: 'coolrepo',
        },
        {
          options: { tree: 'coolrepo/src' },
          pageName: 'treeView',
          text: 'src',
        },
        {
          options: { tree: 'coolrepo/src/tests' },
          pageName: 'treeView',
          text: 'tests',
        },
      ])
    })
  })

  describe('no path is given', () => {
    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/gh/owner/coolrepo']}>
        <Route path="/:provider/:owner/:repo/">
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
          options: {
            tree: 'coolrepo',
          },
          pageName: 'treeView',
          text: 'coolrepo',
        },
      ])
    })
  })
})
