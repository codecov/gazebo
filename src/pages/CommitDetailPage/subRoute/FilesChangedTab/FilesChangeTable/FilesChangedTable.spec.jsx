import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import FilesChangedTable from './FilesChangedTable'

jest.mock('./CommitFileDiff', () => () => 'CommitFileDiff')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/vax/keyleth/commit/123']}>
      <Route
        path={[
          '/:provider/:owner/:repo/commit/:commit',
          '/:provider/:owner/:repo/commit/:commit/blob/:path+',
        ]}
      >
        <Suspense fallback="Loading...">{children}</Suspense>
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('FilesChangedTable', () => {
  function setup(data = [], state = 'processed') {
    server.use(
      graphql.query('Commit', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                __typename: 'Repository',
                commit: {
                  totals: {
                    coverage: 100,
                  },
                  state,
                  commitid: '123',
                  pullId: 1,
                  branchName: null,
                  createdAt: null,
                  author: null,
                  uploads: null,
                  message: null,
                  ciPassed: null,
                  parent: null,
                  compareWithParent: {
                    __typename: 'Comparison',
                    state: 'processed',
                    indirectChangedFilesCount: 2,
                    directChangedFilesCount: 2,
                    patchTotals: null,
                    impactedFiles: data,
                  },
                },
              },
            },
          })
        )
      )
    )
  }

  describe('when data is available', () => {
    beforeEach(() =>
      setup([
        {
          headName: 'src/index2.py',
          baseCoverage: {
            coverage: 62.5,
          },
          headCoverage: {
            coverage: 50.0,
          },
          patchCoverage: {
            coverage: 37.5,
          },
        },
      ])
    )

    it('renders name', async () => {
      render(<FilesChangedTable />, { wrapper })

      const link = await screen.findByRole('link', {
        name: 'src/index2.py',
      })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        '/gh/vax/keyleth/commit/123/blob/src/index2.py'
      )
    })

    it('renders coverage', async () => {
      render(<FilesChangedTable />, { wrapper })

      const coverage = await screen.findByText(/50.00%/)
      expect(coverage).toBeInTheDocument()
    })

    it('renders patch', async () => {
      render(<FilesChangedTable />, { wrapper })

      const patch = await screen.findByText(/37.50%/)
      expect(patch).toBeInTheDocument()
    })

    it('render change', async () => {
      render(<FilesChangedTable />, { wrapper })

      const noData = await screen.findByText(/-12.50%/)
      expect(noData).toBeInTheDocument()
    })
  })

  describe('when all data is missing', () => {
    beforeEach(() => {
      setup([
        {
          headName: '',
          baseCoverage: null,
          headCoverage: null,
          patchCoverage: null,
        },
      ])
    })

    it('does not render coverage', () => {
      render(<FilesChangedTable />, { wrapper })

      const coverage = screen.queryByText(/0.00%/)
      expect(coverage).not.toBeInTheDocument()
    })

    it('renders no available data copy', async () => {
      render(<FilesChangedTable />, { wrapper })

      const copy = await screen.findByText('No data')
      expect(copy).toBeInTheDocument()
    })
  })

  describe('when some data is missing', () => {
    beforeEach(() => {
      setup([
        {
          headName: '',
          baseCoverage: null,
          headCoverage: {
            coverage: 67,
          },
          patchCoverage: {
            coverage: 98,
          },
        },
      ])
    })

    it('renders head coverage', async () => {
      render(<FilesChangedTable />, { wrapper })

      const coverage = await screen.findByText(/67.00%/)
      expect(coverage).toBeInTheDocument()
    })

    it('renders patch coverage', async () => {
      render(<FilesChangedTable />, { wrapper })

      const coverage = await screen.findByText(/98.00%/)
      expect(coverage).toBeInTheDocument()
    })

    it('renders dash for change', async () => {
      render(<FilesChangedTable />, { wrapper })

      const dash = await screen.findByText('-')
      expect(dash).toBeInTheDocument()
    })
  })

  describe('when no changes', () => {
    beforeEach(() => {
      setup()
    })

    it('renders coverage', async () => {
      render(<FilesChangedTable />, { wrapper })

      const coverage = await screen.findByText(
        'No files covered by tests were changed'
      )
      expect(coverage).toBeInTheDocument()
    })
  })

  describe('when expanding the name column', () => {
    beforeEach(() => {
      setup([
        {
          headName: 'src/index2.py',
          baseCoverage: {
            coverage: 62.5,
          },
          headCoverage: {
            coverage: 50.0,
          },
          patchCoverage: {
            coverage: 37.5,
          },
        },
      ])
    })

    it('renders the CommitFileDiff component', async () => {
      const user = userEvent.setup()
      render(<FilesChangedTable />, { wrapper })

      const nameExpander = await screen.findByText('src/index2.py')
      await user.click(nameExpander)

      const commitFileDiff = await screen.findByText('CommitFileDiff')
      expect(commitFileDiff).toBeInTheDocument()
    })
  })
})
