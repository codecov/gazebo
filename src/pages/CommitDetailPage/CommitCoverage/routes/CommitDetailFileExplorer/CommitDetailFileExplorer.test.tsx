import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitDetailFileExplorer from './CommitDetailFileExplorer'

vi.mock('../ComponentsSelector', () => ({
  default: () => 'Components Selector',
}))
vi.mock('./CommitDetailFileExplorerTable', () => ({
  default: () => 'Table',
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const server = setupServer()

const mockTreeData = {
  repository: {
    __typename: 'Repository',
    commit: {
      pathContents: {
        __typename: 'PathContents',
        results: [
          {
            __typename: 'PathContentDir',
            hits: 9,
            misses: 0,
            partials: 0,
            lines: 10,
            name: 'src',
            path: 'src',
            type: 'dir',
            percentCovered: 100.0,
          },
          {
            __typename: 'PathContentFile',
            hits: 9,
            type: 'file',
            misses: 0,
            partials: 0,
            lines: 10,
            name: 'file.js',
            path: 'a/b/c/file.js',
            percentCovered: 100.0,
            isCriticalFile: false,
          },
        ],
      },
    },
  },
}

type WrapperClosure = (
  initialEntries?: string[]
) => React.FC<React.PropsWithChildren>

const wrapper: WrapperClosure =
  (initialEntries = ['/gh/codecov/cool-repo/commit/sha256/tree/a/b/c']) =>
  ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo/commit/:commit/tree/:path+">
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

describe('CommitDetailFileExplorer', () => {
  function setup() {
    server.use(
      graphql.query('CommitPathContents', (info) => {
        return HttpResponse.json({ data: mockTreeData })
      })
    )
  }

  describe('rendering component', () => {
    setup()
    it('renders the flags selector', async () => {
      render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

      const flagsSelector = await screen.findByText('All flags')
      expect(flagsSelector).toBeInTheDocument()
    })

    it('renders the components selector', async () => {
      setup()
      render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

      const componentsSelector = await screen.findByText('Components Selector')
      expect(componentsSelector).toBeInTheDocument()
    })

    it('renders the file explorer table', async () => {
      setup()
      render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

      const table = await screen.findByText('Table')
      expect(table).toBeInTheDocument()
    })

    it('has a search box', async () => {
      setup()
      render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

      const searchBox = screen.getByRole('textbox', {
        name: 'Search for files',
      })
      expect(searchBox).toBeInTheDocument()
    })
  })
})
