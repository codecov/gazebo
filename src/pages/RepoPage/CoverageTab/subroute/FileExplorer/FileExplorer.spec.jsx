import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import FileExplorer from './FileExplorer'

jest.mock('./FileListTable', () => () => 'File list table')
jest.mock('./CodeTreeTable', () => () => 'Code tree table')
jest.mock(
  'shared/ContentsTable/DisplayTypeButton',
  () => () => 'Display type button'
)
jest.mock('shared/ContentsTable/FileBreadcrumb', () => () => 'File breadcrumb')
jest.mock('ui/SearchField', () => () => 'Search field')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const server = setupServer()

const mockListData = {
  username: 'nicholas-codecov',
  repository: {
    branch: {
      head: {
        pathContents: {
          results: [
            {
              __typename: 'PathContentFile',
              hits: 9,
              misses: 0,
              partials: 0,
              lines: 10,
              name: 'file.js',
              path: 'a/b/c/file.js',
              percentCovered: 100.0,
            },
          ],
          __typename: 'PathContents',
        },
      },
    },
  },
}

const mockTreeData = {
  username: 'nicholas-codecov',
  repository: {
    branch: {
      head: {
        pathContents: {
          results: [
            {
              __typename: 'PathContentDir',
              hits: 9,
              misses: 0,
              partials: 0,
              lines: 10,
              name: 'src',
              path: 'src',
              percentCovered: 100.0,
            },
            {
              __typename: 'PathContentFile',
              hits: 9,
              misses: 0,
              partials: 0,
              lines: 10,
              name: 'file.js',
              path: 'a/b/c/file.js',
              percentCovered: 100.0,
            },
          ],
          __typename: 'PathContents',
        },
      },
    },
  },
}

const mockOverview = {
  owner: { repository: { private: false, defaultBranch: 'main' } },
}

const wrapper =
  (initialEntries = ['/gh/codecov/cool-repo/tree/main/a/b/c']) =>
  ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo/tree/:branch/:path+">
            {children}
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('FileExplorer', () => {
  function setup() {
    server.use(
      graphql.query('BranchContents', (req, res, ctx) => {
        if (
          req.variables?.filters?.displayType &&
          req.variables?.filters?.displayType === 'LIST'
        ) {
          return res(ctx.status(200), ctx.data({ owner: mockListData }))
        }

        return res(ctx.status(200), ctx.data({ owner: mockTreeData }))
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockOverview))
      })
    )
  }

  describe('renders', () => {
    it('renders display type button', async () => {
      setup()
      render(<FileExplorer />, { wrapper: wrapper() })

      const button = await screen.findByText(/Display type button/)
      expect(button).toBeInTheDocument()
    })

    it('renders file breadcrumb', async () => {
      setup()
      render(<FileExplorer />, { wrapper: wrapper() })

      const breadcrumb = await screen.findByText(/File breadcrumb/)
      expect(breadcrumb).toBeInTheDocument()
    })

    it('renders search field', async () => {
      setup()
      render(<FileExplorer />, { wrapper: wrapper() })

      const searchField = await screen.findByText(/Search field/)
      expect(searchField).toBeInTheDocument()
    })

    it('renders the correct table', async () => {
      setup()
      render(<FileExplorer />, { wrapper: wrapper() })

      const table = await screen.findByText('Code tree table')
      expect(table).toBeInTheDocument()
    })

    describe('display type is set to list', () => {
      it('renders file list table', async () => {
        render(<FileExplorer />, {
          wrapper: wrapper([
            '/gh/codecov/cool-repo/tree/main/a/b/c?displayType=list',
          ]),
        })

        const table = await screen.findByText('File list table')
        expect(table).toBeInTheDocument()
      })
    })
  })
})
