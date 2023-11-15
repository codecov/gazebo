import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import FilesChangedTable from './FilesChangedTable'

jest.mock('../shared/CommitFileDiff', () => () => 'CommitFileDiff')

const mockCommitData = ({ data, state }) => ({
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
        createdAt: '2023-01-01T12:00:00.000000',
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

const server = setupServer()

beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

const wrapper =
  (queryClient, initialEntries = '/gh/vax/keyleth/commit/123') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
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
    const mockVars = jest.fn()
    const user = userEvent.setup()
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          suspense: true,
          retry: false,
        },
      },
    })

    server.use(
      graphql.query('Commit', (req, res, ctx) => {
        mockVars(req.variables)
        return res(ctx.status(200), ctx.data(mockCommitData({ data, state })))
      })
    )

    return { queryClient, mockVars, user }
  }

  describe('when data is available', () => {
    const mockData = {
      __typename: 'ImpactedFiles',
      results: [
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
      ],
    }

    it('renders name', async () => {
      const { queryClient } = setup(mockData)
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

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
      const { queryClient } = setup(mockData)
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const coverage = await screen.findByText(/50.00%/)
      expect(coverage).toBeInTheDocument()
    })

    it('renders patch', async () => {
      const { queryClient } = setup(mockData)
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const patch = await screen.findByText(/37.50%/)
      expect(patch).toBeInTheDocument()
    })

    it('render change', async () => {
      const { queryClient } = setup(mockData)
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const noData = await screen.findByText(/-12.50%/)
      expect(noData).toBeInTheDocument()
    })
  })

  describe('when all data is missing', () => {
    const mockData = {
      __typename: 'ImpactedFiles',
      results: [
        {
          headName: '',
          baseCoverage: null,
          headCoverage: null,
          patchCoverage: null,
        },
      ],
    }

    it('does not render coverage', () => {
      const { queryClient } = setup(mockData)
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const coverage = screen.queryByText(/0.00%/)
      expect(coverage).not.toBeInTheDocument()
    })

    it('renders no available data copy', async () => {
      const { queryClient } = setup(mockData)
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const copy = await screen.findByText('No data')
      expect(copy).toBeInTheDocument()
    })
  })

  describe('when some data is missing', () => {
    const mockData = {
      __typename: 'ImpactedFiles',
      results: [
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
      ],
    }

    it('renders head coverage', async () => {
      const { queryClient } = setup(mockData)
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const coverage = await screen.findByText(/67.00%/)
      expect(coverage).toBeInTheDocument()
    })

    it('renders patch coverage', async () => {
      const { queryClient } = setup(mockData)
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const coverage = await screen.findByText(/98.00%/)
      expect(coverage).toBeInTheDocument()
    })

    it('renders dash for change', async () => {
      const { queryClient } = setup(mockData)
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const dash = await screen.findByText('-')
      expect(dash).toBeInTheDocument()
    })
  })

  describe('when no changes', () => {
    describe('returns impacted files with empty results list', () => {
      it('renders error message', async () => {
        const { queryClient } = setup({
          __typename: 'ImpactedFiles',
          results: [],
        })
        render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

        const coverage = await screen.findByText(
          'No files covered by tests were changed'
        )
        expect(coverage).toBeInTheDocument()
      })

      describe('flags are selected', () => {
        it('renders flags specific error message', async () => {
          const { queryClient } = setup({
            __typename: 'ImpactedFiles',
            results: [],
          })

          const path = `/gh/codecov/cool-repo/commit/123${qs.stringify(
            { flags: ['flag-1'] },
            { addQueryPrefix: true }
          )}`
          render(<FilesChangedTable />, { wrapper: wrapper(queryClient, path) })

          const coverage = await screen.findByText(
            'No files covered by tests and selected flags were changed'
          )
          expect(coverage).toBeInTheDocument()
        })
      })
    })

    describe('unknown flags typename is returned', () => {
      it('renders flags specific error message', async () => {
        const { queryClient } = setup({
          __typename: 'UnknownFlags',
          message: 'no flags found',
        })
        render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

        const coverage = await screen.findByText(
          'No files covered by tests and selected flags were changed'
        )
        expect(coverage).toBeInTheDocument()
      })
    })
  })

  describe('when expanding the name column', () => {
    const mockData = {
      __typename: 'ImpactedFiles',
      results: [
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
      ],
    }

    it('renders the CommitFileDiff component', async () => {
      const { queryClient, user } = setup(mockData)
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const nameExpander = await screen.findByText('src/index2.py')
      await user.click(nameExpander)

      const commitFileDiff = await screen.findByText('CommitFileDiff')
      expect(commitFileDiff).toBeInTheDocument()
    })
  })

  describe('when state is pending', () => {
    const mockData = {
      __typename: 'ImpactedFiles',
      results: [
        {
          headName: '',
          baseCoverage: null,
          headCoverage: null,
          patchCoverage: null,
        },
      ],
    }

    it('renders spinner', async () => {
      const { queryClient } = setup(mockData, 'pending')
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const spinner = await screen.findByTestId('spinner')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('flags query param is set', () => {
    const mockData = {
      __typename: 'ImpactedFiles',
      results: [
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
      ],
    }

    it('passes flags as query arg', async () => {
      const { queryClient, mockVars } = setup(mockData)

      const path = `/gh/codecov/cool-repo/commit/123${qs.stringify(
        { flags: ['flag-1'] },
        { addQueryPrefix: true }
      )}`
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient, path) })

      await waitFor(() =>
        expect(mockVars).toBeCalledWith({
          commitid: '123',
          filters: { flags: ['flag-1'], hasUnintendedChanges: false },
          owner: 'codecov',
          provider: 'gh',
          repo: 'cool-repo',
        })
      )
    })
  })
})
