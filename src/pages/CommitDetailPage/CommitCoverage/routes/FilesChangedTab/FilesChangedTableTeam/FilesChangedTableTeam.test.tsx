import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import {
  OrderingDirection,
  OrderingParameter,
} from 'services/commit/useCommitTeam'

import FilesChangedTableTeam, { getFilter } from './FilesChangedTableTeam'

vi.mock('../shared/CommitFileDiff', () => ({ default: () => 'CommitFileDiff' }))

const mockComparisonTeamData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        compareWithParent: {
          __typename: 'Comparison',
          state: 'processed',
          patchTotals: {
            coverage: 100,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [
              { headName: 'src/App.tsx', patchCoverage: { coverage: 100 } },
            ],
          },
        },
      },
    },
  },
}

const mockCommitLiteData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        branchName: null,
        commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
        pullId: 10,
        createdAt: '2020-08-25T16:35:32',
        author: {
          username: 'febg',
        },
        state: 'processed',
        uploads: null,
        message: 'paths test',
        ciPassed: true,
        compareWithParent: {
          __typename: 'Comparison',
          state: 'pending',
          indirectChangedFilesCount: 1,
          directChangedFilesCount: 1,
          patchTotals: {
            coverage: 100,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [
              {
                headName: 'src/App.jsx',
                missesCount: 0,
                patchCoverage: {
                  coverage: 100,
                },
              },
              {
                headName: 'src/File.jsx',
                missesCount: 5,
                patchCoverage: {
                  coverage: null,
                },
              },
            ],
          },
        },
        parent: {
          commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
          coverageAnalytics: {
            totals: {
              coverage: 38.30846,
            },
          },
        },
      },
    },
  },
}

const mockPendingCommit = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        branchName: null,
        commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
        pullId: 10,
        createdAt: '2020-08-25T16:35:32',
        author: {
          username: 'febg',
        },
        state: 'pending',
        uploads: null,
        message: 'paths test',
        ciPassed: true,
        compareWithParent: {
          __typename: 'Comparison',
          state: 'pending',
          indirectChangedFilesCount: 1,
          directChangedFilesCount: 1,
          patchTotals: {
            coverage: 100,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [],
          },
        },
        parent: {
          commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
          coverageAnalytics: {
            totals: {
              coverage: 38.30846,
            },
          },
        },
      },
    },
  },
}

const mockPendingComparison = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        compareWithParent: {
          __typename: 'Comparison',
          state: 'pending',
          patchTotals: {
            coverage: 100,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [],
          },
        },
      },
    },
  },
}

const mockEmptyFilesCommit = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        branchName: null,
        commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
        pullId: 10,
        createdAt: '2020-08-25T16:35:32',
        author: {
          username: 'febg',
        },
        state: 'completed',
        uploads: null,
        message: 'paths test',
        ciPassed: true,
        compareWithParent: {
          __typename: 'Comparison',
          state: 'pending',
          indirectChangedFilesCount: 1,
          directChangedFilesCount: 1,
          patchTotals: {
            coverage: 100,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [],
          },
        },
        parent: {
          commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
          coverageAnalytics: {
            totals: {
              coverage: 38.30846,
            },
          },
        },
      },
    },
  },
}

const mockEmptyFilesComparison = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        compareWithParent: {
          __typename: 'Comparison',
          state: 'pending',
          patchTotals: {
            coverage: 100,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [],
          },
        },
      },
    },
  },
}

const server = setupServer()

const wrapper =
  (queryClient: QueryClient): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/gh/codecov/test-repo/commit/s2h5a6']}>
        <Route path="/:provider/:owner/:repo/commit/:commit">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  pendingCommit?: boolean
  noCoveredFiles?: boolean
  temp?: string
}

describe('FilesChangedTableTeam', () => {
  function setup(
    { pendingCommit = false, noCoveredFiles = false, temp }: SetupArgs = {
      pendingCommit: false,
      noCoveredFiles: false,
    }
  ) {
    const user = userEvent.setup()
    const mockVars = vi.fn()

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    server.use(
      graphql.query('GetCommitTeam', (info) => {
        mockVars(info.variables?.filters)

        if (pendingCommit) {
          return HttpResponse.json({ data: mockPendingCommit })
        }

        if (noCoveredFiles) {
          return HttpResponse.json({ data: mockEmptyFilesCommit })
        }

        return HttpResponse.json({ data: mockCommitLiteData })
      }),
      graphql.query('GetCompareTotalsTeam', (info) => {
        mockVars(info.variables)

        if (pendingCommit) {
          return HttpResponse.json({ data: mockPendingComparison })
        }

        if (noCoveredFiles) {
          return HttpResponse.json({ data: mockEmptyFilesComparison })
        }

        return HttpResponse.json({ data: mockComparisonTeamData })
      })
    )

    return { user, mockVars, queryClient }
  }

  describe('renders header', () => {
    it('renders name column', async () => {
      const { queryClient } = setup()
      render(<FilesChangedTableTeam />, { wrapper: wrapper(queryClient) })

      const nameHeader = await screen.findByText('Name')
      expect(nameHeader).toBeInTheDocument()
    })

    it('renders missed lines column', async () => {
      const { queryClient } = setup()
      render(<FilesChangedTableTeam />, { wrapper: wrapper(queryClient) })

      const nameHeader = await screen.findByText('Missed lines')
      expect(nameHeader).toBeInTheDocument()
    })

    it('renders patch % column', async () => {
      const { queryClient } = setup()
      render(<FilesChangedTableTeam />, { wrapper: wrapper(queryClient) })

      const nameHeader = await screen.findByText('Patch %')
      expect(nameHeader).toBeInTheDocument()
    })
  })

  describe('renders data rows', () => {
    it('renders name column', async () => {
      const { queryClient } = setup()
      render(<FilesChangedTableTeam />, { wrapper: wrapper(queryClient) })

      await expect(await screen.findByText('src/App.jsx')).toBeTruthy()

      const path = screen.getByText('src/App.jsx')
      expect(path).toBeInTheDocument()
    })

    it('renders missed lines column', async () => {
      const { queryClient } = setup()
      render(<FilesChangedTableTeam />, { wrapper: wrapper(queryClient) })

      await expect(await screen.findByText('0')).toBeTruthy()

      const missesCount = screen.getByText('0')
      expect(missesCount).toBeInTheDocument()
    })

    it('renders patch % column', async () => {
      const { queryClient } = setup()
      render(<FilesChangedTableTeam />, { wrapper: wrapper(queryClient) })

      await expect(await screen.findByText('100.00%')).toBeTruthy()

      const path = screen.getByText('100.00%')
      expect(path).toBeInTheDocument()
    })
  })

  describe('commit is pending', () => {
    it('renders spinner', async () => {
      const { queryClient } = setup({ pendingCommit: true })
      render(<FilesChangedTableTeam />, { wrapper: wrapper(queryClient) })

      await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
      await waitFor(() => expect(queryClient.isFetching()).toBe(0))

      const spinner = await screen.findByTestId('spinner')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('no files were changed', () => {
    it('renders no file covered message', async () => {
      const { queryClient } = setup({ noCoveredFiles: true })
      render(<FilesChangedTableTeam />, { wrapper: wrapper(queryClient) })

      const noFiles = await screen.findByText(
        'No files covered by tests were changed'
      )
      expect(noFiles).toBeInTheDocument()
    })
  })

  describe('expanding file diffs', () => {
    it('renders commit file diff', async () => {
      const { queryClient, user } = setup()
      render(<FilesChangedTableTeam />, { wrapper: wrapper(queryClient) })

      expect(await screen.findByTestId('file-diff-expand')).toBeTruthy()
      const expander = screen.getByTestId('file-diff-expand')
      expect(expander).toBeInTheDocument()
      await user.click(expander)

      const commitFileDiff = await screen.findByText('CommitFileDiff')
      expect(commitFileDiff).toBeInTheDocument()
    })
  })
})

describe('getFilter', () => {
  describe('passed array is empty', () => {
    it('returns undefined', () => {
      const data = getFilter([])

      expect(data).toBeUndefined()
    })
  })

  describe('id is name', () => {
    describe('desc is true', () => {
      it('returns id name, desc direction', () => {
        const data = getFilter([{ id: 'name', desc: true }])

        expect(data).toStrictEqual({
          direction: OrderingDirection.desc,
          parameter: OrderingParameter.FILE_NAME,
        })
      })
    })

    describe('desc is false', () => {
      it('returns id name, asc direction', () => {
        const data = getFilter([{ id: 'name', desc: false }])

        expect(data).toStrictEqual({
          direction: OrderingDirection.asc,
          parameter: OrderingParameter.FILE_NAME,
        })
      })
    })
  })

  describe('id is missedLines', () => {
    describe('desc is true', () => {
      it('returns id missed lines, desc direction', () => {
        const data = getFilter([{ id: 'missedLines', desc: true }])

        expect(data).toStrictEqual({
          direction: OrderingDirection.desc,
          parameter: OrderingParameter.MISSES_COUNT,
        })
      })
    })

    describe('desc is false', () => {
      it('returns id missed lines, asc direction', () => {
        const data = getFilter([{ id: 'missedLines', desc: false }])

        expect(data).toStrictEqual({
          direction: OrderingDirection.asc,
          parameter: OrderingParameter.MISSES_COUNT,
        })
      })
    })
  })

  describe('id is patchPercentage', () => {
    describe('desc is true', () => {
      it('returns id patchPercentage, desc direction', () => {
        const data = getFilter([{ id: 'patchPercentage', desc: true }])

        expect(data).toStrictEqual({
          direction: OrderingDirection.desc,
          parameter: OrderingParameter.PATCH_COVERAGE,
        })
      })
    })

    describe('desc is false', () => {
      it('returns id patch percentage, asc direction', () => {
        const data = getFilter([{ id: 'name', desc: false }])

        expect(data).toStrictEqual({
          direction: OrderingDirection.asc,
          parameter: OrderingParameter.FILE_NAME,
        })
      })
    })
  })
})
