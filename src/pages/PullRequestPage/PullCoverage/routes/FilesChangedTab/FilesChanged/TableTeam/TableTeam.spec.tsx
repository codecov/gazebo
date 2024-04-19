import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { OrderingDirection, OrderingParameter } from 'services/pull/usePullTeam'

import TableTeam, { getFilter } from './TableTeam'

jest.mock('../../shared/FileDiff', () => () => 'FileDiff')

const mockComparisonTeamData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
          __typename: 'Comparison',
          state: 'processed',
          patchTotals: {
            coverage: 100,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [
              {
                headName: 'src/App.tsx',
                missesCount: 0,
                isCriticalFile: false,
                patchCoverage: { coverage: 100 },
              },
            ],
          },
        },
      },
    },
  },
}

const mockPullTeamData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        pullId: 10,
        state: 'processed',
        compareWithBase: {
          __typename: 'Comparison',
          state: 'pending',
          patchTotals: {
            coverage: 100,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [
              {
                headName: 'src/App.jsx',
                missesCount: 0,
                isCriticalFile: false,
                patchCoverage: {
                  coverage: 100,
                },
              },
              {
                headName: 'src/File.jsx',
                missesCount: 5,
                isCriticalFile: false,
                patchCoverage: {
                  coverage: null,
                },
              },
            ],
          },
        },
      },
    },
  },
}

const mockPendingPull = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        pullId: 10,
        state: 'pending',
        compareWithBase: {
          __typename: 'Comparison',
          state: 'pending',
          patchTotals: {
            coverage: 100,
          },
          impactedFiles: { __typename: 'ImpactedFiles', results: [] },
        },
      },
    },
  },
}

const mockPendingComparison = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
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

const mockEmptyFilesPull = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        pullId: 10,
        state: 'completed',
        compareWithBase: {
          __typename: 'Comparison',
          state: 'completed',
          patchTotals: {
            coverage: 100,
          },
          impactedFiles: { __typename: 'ImpactedFiles', results: [] },
        },
      },
    },
  },
}

const mockEmptyFilesComparison = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
          __typename: 'Comparison',
          state: 'pending',
          patchTotals: {
            coverage: 100,
          },
          impactedFiles: { __typename: 'ImpactedFiles', results: [] },
        },
      },
    },
  },
}

const mockPullCriticalFileData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        pullId: 10,
        state: 'completed',
        compareWithBase: {
          __typename: 'Comparison',
          state: 'processed',
          patchTotals: {
            coverage: 100,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [
              {
                headName: 'src/App.tsx',
                missesCount: 0,
                isCriticalFile: true,
                patchCoverage: { coverage: 100 },
              },
            ],
          },
        },
      },
    },
  },
}

const mockNoChangeFileData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        pullId: 10,
        state: 'completed',
        compareWithBase: {
          __typename: 'Comparison',
          state: 'processed',
          patchTotals: {
            coverage: 100,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [
              {
                headName: 'src/App.tsx',
                missesCount: 0,
                isCriticalFile: false,
                patchCoverage: { coverage: null },
              },
            ],
          },
        },
      },
    },
  },
}

const server = setupServer()

const wrapper =
  (
    queryClient: QueryClient,
    initialEntries = ['/gh/codecov/test-repo/pull/s2h5a6']
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo/pull/:pull">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  pendingPull?: boolean
  noCoveredFiles?: boolean
  criticalFile?: boolean
  noChange?: boolean
}

describe('TableTeam', () => {
  function setup(
    {
      pendingPull = false,
      noCoveredFiles = false,
      criticalFile = false,
      noChange = false,
    }: SetupArgs = {
      pendingPull: false,
      noCoveredFiles: false,
      criticalFile: false,
      noChange: false,
    }
  ) {
    const user = userEvent.setup()
    const mockVars = jest.fn()

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    server.use(
      graphql.query('GetPullTeam', (req, res, ctx) => {
        mockVars(req.variables?.filters)

        if (pendingPull) {
          return res(ctx.status(200), ctx.data(mockPendingPull))
        }

        if (noCoveredFiles) {
          return res(ctx.status(200), ctx.data(mockEmptyFilesPull))
        }

        if (criticalFile) {
          return res(ctx.status(200), ctx.data(mockPullCriticalFileData))
        }

        if (noChange) {
          return res(ctx.status(200), ctx.data(mockNoChangeFileData))
        }

        return res(ctx.status(200), ctx.data(mockPullTeamData))
      }),
      graphql.query('GetPullCompareTotalsTeam', (req, res, ctx) => {
        mockVars(req.variables)

        if (pendingPull) {
          return res(ctx.status(200), ctx.data(mockPendingComparison))
        }

        if (noCoveredFiles) {
          return res(ctx.status(200), ctx.data(mockEmptyFilesComparison))
        }

        if (criticalFile) {
          return res(ctx.status(200), ctx.data(mockPullCriticalFileData))
        }

        if (noChange) {
          return res(ctx.status(200), ctx.data(mockNoChangeFileData))
        }

        return res(ctx.status(200), ctx.data(mockComparisonTeamData))
      })
    )

    return { user, mockVars, queryClient }
  }

  describe('renders header', () => {
    it('renders name column', async () => {
      const { queryClient } = setup()
      render(<TableTeam />, { wrapper: wrapper(queryClient) })

      const nameHeader = await screen.findByText('Name')
      expect(nameHeader).toBeInTheDocument()
    })

    it('renders missed lines column', async () => {
      const { queryClient } = setup()
      render(<TableTeam />, { wrapper: wrapper(queryClient) })

      const nameHeader = await screen.findByText('Missed lines')
      expect(nameHeader).toBeInTheDocument()
    })

    it('renders patch % column', async () => {
      const { queryClient } = setup()
      render(<TableTeam />, { wrapper: wrapper(queryClient) })

      const nameHeader = await screen.findByText('Patch %')
      expect(nameHeader).toBeInTheDocument()
    })
  })

  describe('renders data rows', () => {
    it('renders name column', async () => {
      const { queryClient } = setup()
      render(<TableTeam />, { wrapper: wrapper(queryClient) })

      await expect(
        await screen.findByRole('link', { name: 'src/App.tsx' })
      ).toBeTruthy()

      const path = screen.getByRole('link', { name: 'src/App.tsx' })
      expect(path).toBeInTheDocument()
    })

    it('renders missed lines column', async () => {
      const { queryClient } = setup()
      render(<TableTeam />, { wrapper: wrapper(queryClient) })

      await expect(await screen.findByText('0')).toBeTruthy()

      const missesCount = screen.getByText('0')
      expect(missesCount).toBeInTheDocument()
    })

    it('renders patch % column', async () => {
      const { queryClient } = setup()
      render(<TableTeam />, { wrapper: wrapper(queryClient) })

      await expect(await screen.findByText('100.00%')).toBeTruthy()

      const path = screen.getByText('100.00%')
      expect(path).toBeInTheDocument()
    })
  })

  describe('pull is pending', () => {
    it('renders spinner', async () => {
      const { queryClient } = setup({ pendingPull: true })
      render(<TableTeam />, { wrapper: wrapper(queryClient) })

      await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
      await waitFor(() => expect(queryClient.isFetching()).toBe(0))

      const spinner = await screen.findByTestId('spinner')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('no files were changed', () => {
    it('renders no file covered message', async () => {
      const { queryClient } = setup({ noCoveredFiles: true })
      render(<TableTeam />, { wrapper: wrapper(queryClient) })

      const noFiles = await screen.findByText(
        'No files covered by tests were changed'
      )
      expect(noFiles).toBeInTheDocument()
    })
  })

  describe('expanding file diffs', () => {
    it('renders pull file diff', async () => {
      const { queryClient, user } = setup()
      render(<TableTeam />, { wrapper: wrapper(queryClient) })

      expect(await screen.findByTestId('file-diff-expand')).toBeTruthy()
      const expander = screen.getByTestId('file-diff-expand')
      expect(expander).toBeInTheDocument()
      await user.click(expander)

      const pullFileDiff = await screen.findByText('FileDiff')
      expect(pullFileDiff).toBeInTheDocument()
    })

    it('auto expands if param is passed in url', async () => {
      const { queryClient } = setup()
      render(<TableTeam />, {
        wrapper: wrapper(queryClient, [
          '/gh/codecov/test-repo/pull/s2h5a6?filepath=src/App.jsx',
        ]),
      })

      const pullFileDiff = await screen.findByText('FileDiff')
      expect(pullFileDiff).toBeInTheDocument()
    })
  })

  describe('highlights critical files', () => {
    it('renders critical file', async () => {
      const { queryClient } = setup({ criticalFile: true })
      render(<TableTeam />, { wrapper: wrapper(queryClient) })

      const criticalFile = await screen.findByText('Critical File')
      expect(criticalFile).toBeInTheDocument()
    })

    it('renders non-critical file', async () => {
      const { queryClient } = setup({ criticalFile: false })
      render(<TableTeam />, { wrapper: wrapper(queryClient) })

      const file = await screen.findByText('src/App.tsx')
      expect(file).toBeInTheDocument()

      const nonCriticalFile = screen.queryByText('Critical File')
      expect(nonCriticalFile).not.toBeInTheDocument()
    })
  })

  describe('patch coverage renderer', () => {
    it('renders critical file', async () => {
      const { queryClient } = setup({ noChange: true })
      render(<TableTeam />, { wrapper: wrapper(queryClient) })

      const noChange = await screen.findByText('-')
      expect(noChange).toBeInTheDocument()
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
