import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { ImpactedFileType } from 'services/commit'

import FilesChangedTable from './FilesChangedTable'

vi.mock('../shared/CommitFileDiff', () => ({ default: () => 'CommitFileDiff' }))

const mockCommitData = (data: SetupArgs, state: string) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        coverageAnalytics: {
          totals: {
            coverage: 100,
          },
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
  vi.clearAllMocks()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

const wrapper =
  (
    queryClient: QueryClient,
    initialEntries: string = '/gh/vax/keyleth/commit/123'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
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

type SetupArgs = {
  __typename: string
  results?: ImpactedFileType[]
  message?: string
}

describe('FilesChangedTable', () => {
  function setup(data: SetupArgs, state = 'processed') {
    const mockVars = vi.fn()
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
      graphql.query('Commit', (info) => {
        mockVars(info.variables)
        return HttpResponse.json({ data: mockCommitData(data, state) })
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
          isCriticalFile: false,
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
    const mockEmptyData = {
      __typename: 'ImpactedFiles',
      results: [
        {
          headName: '',
          isCriticalFile: false,
          baseCoverage: null,
          headCoverage: null,
          patchCoverage: null,
        },
      ],
    }

    it('does not render coverage', () => {
      const { queryClient } = setup(mockEmptyData)
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const coverage = screen.queryByText(/0.00%/)
      expect(coverage).not.toBeInTheDocument()
    })

    it('renders dashes', async () => {
      const { queryClient } = setup(mockEmptyData)
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const copy = await screen.findAllByText('-')
      expect(copy).toHaveLength(3)
    })
  })

  describe('when some data is missing', () => {
    const mockData = {
      __typename: 'ImpactedFiles',
      results: [
        {
          headName: '',
          isCriticalFile: false,
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
          isCriticalFile: false,
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

      expect(await screen.findByTestId('file-diff-expand')).toBeTruthy()
      const expander = screen.getByTestId('file-diff-expand')
      expect(expander).toBeInTheDocument()
      await user.click(expander)

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
          isCriticalFile: false,
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

  describe('highlights critical files', () => {
    it('renders critical file', async () => {
      const { queryClient } = setup({
        __typename: 'ImpactedFiles',
        results: [
          {
            headName: 'src/main.rs',
            isCriticalFile: true,
            baseCoverage: {
              coverage: 40.0,
            },
            headCoverage: {
              coverage: 50.0,
            },
            patchCoverage: {
              coverage: 100.0,
            },
          },
        ],
      })
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const criticalFile = await screen.findByText(/Critical file/)
      expect(criticalFile).toBeInTheDocument()
    })

    it('renders non-critical file', async () => {
      const { queryClient } = setup({
        __typename: 'ImpactedFiles',
        results: [
          {
            headName: 'src/main.rs',
            isCriticalFile: false,
            baseCoverage: {
              coverage: 40.0,
            },
            headCoverage: {
              coverage: 50.0,
            },
            patchCoverage: {
              coverage: 100.0,
            },
          },
        ],
      })
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const criticalFile = screen.queryByText(/Critical file/)
      expect(criticalFile).not.toBeInTheDocument()
    })
  })

  describe('highlights deleted files', () => {
    it('renders deleted file', async () => {
      const { queryClient } = setup({
        __typename: 'ImpactedFiles',
        results: [
          {
            headName: 'src/main.rs',
            isCriticalFile: false,
            baseCoverage: null,
            headCoverage: null,
            patchCoverage: null,
          },
        ],
      })
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const deletedFile = await screen.findByText(/Deleted file/)
      expect(deletedFile).toBeInTheDocument()
    })

    it('renders non-deleted file', async () => {
      const { queryClient } = setup({
        __typename: 'ImpactedFiles',
        results: [
          {
            headName: 'src/main.rs',
            isCriticalFile: false,
            baseCoverage: {
              coverage: 40.0,
            },
            headCoverage: {
              coverage: 50.0,
            },
            patchCoverage: {
              coverage: 100.0,
            },
          },
        ],
      })
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const deletedFile = screen.queryByText(/Deleted file/)
      expect(deletedFile).not.toBeInTheDocument()
    })
  })

  describe('flags query param is set', () => {
    const mockData = {
      __typename: 'ImpactedFiles',
      results: [
        {
          headName: 'src/index2.py',
          isCriticalFile: false,
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
        expect(mockVars).toHaveBeenCalledWith({
          commitid: '123',
          filters: expect.objectContaining({
            flags: ['flag-1'],
            hasUnintendedChanges: false,
          }),
          owner: 'codecov',
          provider: 'gh',
          repo: 'cool-repo',
          isTeamPlan: false,
        })
      )
    })
  })

  describe('components query param is set', () => {
    const mockData = {
      __typename: 'ImpactedFiles',
      results: [
        {
          headName: 'src/index2.py',
          isCriticalFile: false,
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

    it('passes components as query arg', async () => {
      const { queryClient, mockVars } = setup(mockData)

      const path = `/gh/codecov/cool-repo/commit/123${qs.stringify(
        { components: ['component-1'] },
        { addQueryPrefix: true }
      )}`
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient, path) })

      await waitFor(() =>
        expect(mockVars).toHaveBeenCalledWith({
          commitid: '123',
          filters: expect.objectContaining({
            components: ['component-1'],
            hasUnintendedChanges: false,
          }),
          owner: 'codecov',
          provider: 'gh',
          repo: 'cool-repo',
          isTeamPlan: false,
        })
      )
    })
  })

  describe('sorting the table', () => {
    const user = userEvent.setup()
    const mockData = {
      __typename: 'ImpactedFiles',
      results: [
        {
          headName: 'src/index2.py',
          isCriticalFile: false,
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
        {
          headName: 'src/index3.py',
          isCriticalFile: false,
          baseCoverage: {
            coverage: 64.5,
          },
          headCoverage: {
            coverage: 52.0,
          },
          patchCoverage: {
            coverage: 31.5,
          },
        },
      ],
    }

    it('sorts by name', async () => {
      const { queryClient, mockVars } = setup(mockData)

      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const header = await screen.findByText(/Name/)
      expect(header).toBeInTheDocument()
      await user.click(header)
      await waitFor(() => {
        expect(mockVars).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              ordering: {
                direction: 'ASC',
                parameter: 'FILE_NAME',
              },
            }),
          })
        )
      })
      await user.click(header)
      await waitFor(() => {
        expect(mockVars).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              ordering: {
                direction: 'DESC',
                parameter: 'FILE_NAME',
              },
            }),
          })
        )
      })
    })

    it('sorts by head coverage', async () => {
      const { queryClient, mockVars } = setup(mockData)
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })
      const header = await screen.findByText(/HEAD/)
      expect(header).toBeInTheDocument()
      await user.click(header)
      await waitFor(() => {
        expect(mockVars).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              ordering: {
                direction: 'ASC',
                parameter: 'HEAD_COVERAGE',
              },
            }),
          })
        )
      })
      await user.click(header)
      await waitFor(() => {
        expect(mockVars).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              ordering: {
                direction: 'DESC',
                parameter: 'HEAD_COVERAGE',
              },
            }),
          })
        )
      })
    })

    it('sorts by change', async () => {
      const { queryClient, mockVars } = setup(mockData)

      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const header = await screen.findByText(/Change/)
      expect(header).toBeInTheDocument()
      await user.click(header)
      await waitFor(() => {
        expect(mockVars).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              ordering: {
                direction: 'DESC',
                parameter: 'CHANGE_COVERAGE',
              },
            }),
          })
        )
      })
      await user.click(header)
      await waitFor(() => {
        expect(mockVars).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              ordering: {
                direction: 'ASC',
                parameter: 'CHANGE_COVERAGE',
              },
            }),
          })
        )
      })
    })

    it('sorts by patch coverage', async () => {
      const { queryClient, mockVars } = setup(mockData)

      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const header = await screen.findByText(/Patch %/)
      expect(header).toBeInTheDocument()
      await user.click(header)
      await waitFor(() => {
        expect(mockVars).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              ordering: {
                direction: 'DESC',
                parameter: 'PATCH_COVERAGE',
              },
            }),
          })
        )
      })
      await user.click(header)
      await waitFor(() => {
        expect(mockVars).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              ordering: {
                direction: 'ASC',
                parameter: 'PATCH_COVERAGE',
              },
            }),
          })
        )
      })
    })
  })
})
