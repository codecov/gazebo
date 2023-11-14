import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import IndirectChangesTable from '../IndirectChangesTable'

jest.mock('shared/featureFlags')
jest.mock('./CommitFileDiff', () => () => 'CommitFileDiff')

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
  (
    queryClient,
    initialEntries = '/gh/codecov/cool-repo/commit/123/indirect-changes'
  ) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route
            path={[
              '/:provider/:owner/:repo/commit/:commit/indirect-changes',
              '/:provider/:owner/:repo/commit/:commit/blob/:path+',
            ]}
          >
            <Suspense fallback="Loading...">{children}</Suspense>
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

describe('IndirectChangesTable', () => {
  function setup(data = [], state = 'processed') {
    const user = userEvent.setup()
    const mockVars = jest.fn()
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          suspense: true,
          retry: false,
        },
      },
    })

    useFlags.mockReturnValue({
      commitTabFlagMultiSelect: true,
    })

    server.use(
      graphql.query('Commit', (req, res, ctx) => {
        mockVars(req.variables)
        return res(
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
        )
      })
    )

    return { mockVars, queryClient, user }
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
      render(<IndirectChangesTable />, { wrapper: wrapper(queryClient) })

      const link = await screen.findByRole('link', {
        name: 'src/index2.py',
      })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        '/gh/codecov/cool-repo/commit/123/blob/src/index2.py'
      )
    })

    it('renders coverage', async () => {
      const { queryClient } = setup(mockData)
      render(<IndirectChangesTable />, { wrapper: wrapper(queryClient) })

      const coverage = await screen.findByText(/50.00%/)
      expect(coverage).toBeInTheDocument()
    })

    it('render change', async () => {
      const { queryClient } = setup(mockData)
      render(<IndirectChangesTable />, { wrapper: wrapper(queryClient) })

      const noData = await screen.findByText(/-12.50%/)
      expect(noData).toBeInTheDocument()
    })

    describe('flag is present in query params', () => {
      it('fetches with flags filter', async () => {
        const { queryClient, mockVars } = setup(mockData)
        const path = `/gh/codecov/cool-repo/commit/123/indirect-changes${qs.stringify(
          { flags: ['flag-1'] },
          { addQueryPrefix: true }
        )}`
        render(<IndirectChangesTable />, {
          wrapper: wrapper(queryClient, path),
        })

        await waitFor(() =>
          expect(mockVars).toBeCalledWith({
            commitid: '123',
            filters: {
              hasUnintendedChanges: true,
              flags: ['flag-1'],
            },
            owner: 'codecov',
            provider: 'gh',
            repo: 'cool-repo',
          })
        )
      })
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
      render(<IndirectChangesTable />, { wrapper: wrapper(queryClient) })

      const coverage = screen.queryByText(/0.00%/)
      expect(coverage).not.toBeInTheDocument()
    })

    it('renders no available data copy', async () => {
      const { queryClient } = setup(mockData)
      render(<IndirectChangesTable />, { wrapper: wrapper(queryClient) })

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
      render(<IndirectChangesTable />, { wrapper: wrapper(queryClient) })

      const coverage = await screen.findByText(/67.00%/)
      expect(coverage).toBeInTheDocument()
    })

    it('renders dash for change', async () => {
      const { queryClient } = setup(mockData)
      render(<IndirectChangesTable />, { wrapper: wrapper(queryClient) })

      const dash = await screen.findByText('-')
      expect(dash).toBeInTheDocument()
    })
  })

  describe('when no changes', () => {
    describe('returns an empty results array', () => {
      it('renders no files covered error message', async () => {
        const { queryClient } = setup({
          __typename: 'ImpactedFiles',
          results: [],
        })
        render(<IndirectChangesTable />, { wrapper: wrapper(queryClient) })

        const coverage = await screen.findByText(
          'No files covered by tests were changed'
        )
        expect(coverage).toBeInTheDocument()
      })

      describe('flags param in url is set', () => {
        it('renders flags no files error message', async () => {
          const { queryClient } = setup({
            __typename: 'ImpactedFiles',
            results: [],
          })
          const path = `/gh/codecov/cool-repo/commit/123/indirect-changes${qs.stringify(
            { flags: ['flag-1'] },
            { addQueryPrefix: true }
          )}`
          render(<IndirectChangesTable />, {
            wrapper: wrapper(queryClient, path),
          })

          const coverage = await screen.findByText(
            'No files covered by tests and selected flags were changed'
          )
          expect(coverage).toBeInTheDocument()
        })
      })
    })

    describe('returns __typename of unknown flags', () => {
      it('renders flags no files error message', async () => {
        const { queryClient } = setup({
          __typename: 'UnknownFlags',
          message: 'no flags found',
        })
        render(<IndirectChangesTable />, { wrapper: wrapper(queryClient) })

        const coverage = await screen.findByText(
          'No files covered by tests and selected flags were changed'
        )
        expect(coverage).toBeInTheDocument()
      })
    })
  })

  describe('when impacted files are in pending state', () => {
    it('renders spinner', async () => {
      const { queryClient } = setup(
        {
          __typename: 'ImpactedFiles',
          results: [],
        },
        'pending'
      )
      render(<IndirectChangesTable />, { wrapper: wrapper(queryClient) })

      const spinner = await screen.findByTestId('spinner')
      expect(spinner).toBeInTheDocument()
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
      render(<IndirectChangesTable />, { wrapper: wrapper(queryClient) })

      const nameExpander = await screen.findByText('src/index2.py')
      await user.click(nameExpander)

      const commitFileDiff = await screen.findByText('CommitFileDiff')
      expect(commitFileDiff).toBeInTheDocument()
    })
  })
})
