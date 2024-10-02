import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import FileExplorer from './FileExplorer'

vi.mock('./FileListTable', () => ({ default: () => 'File list table' }))
vi.mock('./CodeTreeTable', () => ({ default: () => 'Code tree table' }))
vi.mock('shared/ContentsTable/DisplayTypeButton', () => ({
  default: () => 'Display type button',
}))
vi.mock('shared/ContentsTable/FileBreadcrumb', () => ({
  default: () => 'File breadcrumb',
}))
vi.mock('./FlagMultiSelect', () => ({ default: () => 'FlagMultiSelect' }))
vi.mock('../ComponentsMultiSelect', () => ({
  default: () => 'Components Selector',
}))

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

const mockUnknownPath = {
  username: 'nicholas-codecov',
  repository: {
    branch: {
      head: {
        pathContents: {
          results: [],
          __typename: 'UnknownPath',
        },
      },
    },
  },
}

const mockMissingCoverage = {
  username: 'nicholas-codecov',
  repository: {
    branch: {
      head: {
        pathContents: {
          results: [],
          __typename: 'MissingCoverage',
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

let testLocation
const wrapper =
  (initialEntries = ['/gh/codecov/cool-repo/tree/main/a/b/c']) =>
  ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo/tree/:branch/:path+">
            {children}
          </Route>
          <Route
            path="*"
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
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
  function setup(missingCoverage = false, unknownPath = false) {
    const user = userEvent.setup()

    server.use(
      graphql.query('BranchContents', (info) => {
        if (
          info.variables?.filters?.displayType &&
          info.variables?.filters?.displayType === 'LIST'
        ) {
          return HttpResponse.json({ data: { owner: mockListData } })
        }

        if (missingCoverage) {
          return HttpResponse.json({ data: { owner: mockMissingCoverage } })
        }

        if (unknownPath) {
          return HttpResponse.json({ data: { owner: mockUnknownPath } })
        }

        return HttpResponse.json({ data: { owner: mockTreeData } })
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: mockOverview })
      })
    )

    return { user }
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

    it('renders flag multi select', async () => {
      setup()
      render(<FileExplorer />, { wrapper: wrapper() })

      const flagMultiSelect = await screen.findByText(/FlagMultiSelect/)
      expect(flagMultiSelect).toBeInTheDocument()
    })

    it('renders search field', async () => {
      setup()
      render(<FileExplorer />, { wrapper: wrapper() })

      const searchField = await screen.findByText(/Search for files/)
      expect(searchField).toBeInTheDocument()
    })

    it('renders the correct table', async () => {
      setup()
      render(<FileExplorer />, { wrapper: wrapper() })

      const table = await screen.findByText('Code tree table')
      expect(table).toBeInTheDocument()
    })

    it('renders components selector', async () => {
      setup()
      render(<FileExplorer />, { wrapper: wrapper() })

      const searchField = await screen.findByText(/Components Selector/)
      expect(searchField).toBeInTheDocument()
    })

    describe('user searches for a file', () => {
      it('updates the url state', async () => {
        const { user } = setup()

        render(<FileExplorer />, { wrapper: wrapper() })

        const searchField = await screen.findByText(/Search for files/)
        expect(searchField).toBeInTheDocument()
        await user.type(searchField, 'cool-search')

        await waitFor(() =>
          expect(testLocation.state).toStrictEqual({
            search: 'cool-search',
          })
        )
      })
    })

    describe('display type is set to list', () => {
      it('renders file list table', async () => {
        setup()
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
