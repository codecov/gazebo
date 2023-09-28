import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { CommitStateEnum } from 'shared/utils/commit'
import { ComparisonReturnType } from 'shared/utils/comparison'

import IndirectChangesTab from './IndirectChangesTab'

jest.mock(
  './IndirectChangedFiles/IndirectChangedFiles',
  () => () => 'IndirectChangedFiles Component'
)

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/sonik/repo/pull/9']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const mockImpactedFiles = [
  {
    isCriticalFile: true,
    fileName: 'mafs.js',
    headName: 'flag1/mafs.js',
    baseCoverage: {
      percentCovered: 45.38,
    },
    headCoverage: {
      percentCovered: 90.23,
      missesCount: 3,
    },
    patchCoverage: {
      percentCovered: 27.43,
    },
    missesInComparison: 3,
  },
  {
    isCriticalFile: true,
    fileName: 'quarg.js',
    headName: 'flag2/quarg.js',
    baseCoverage: {
      percentCovered: 39,
    },
    headCoverage: {
      percentCovered: 80,
      missesCount: 7,
    },
    patchCoverage: {
      percentCovered: 48.23,
    },
    missesInComparison: 7,
  },
]

const mockPull = {
  owner: {
    repository: {
      pull: {
        pullId: 14,
        head: {
          state: CommitStateEnum.COMPLETE,
        },
        compareWithBase: {
          __typename: ComparisonReturnType.SUCCESSFUL_COMPARISON,
          patchTotals: {
            percentCovered: 92.12,
          },
          headTotals: {
            percentCovered: 74.2,
          },
          baseTotals: {
            percentCovered: 27.35,
          },
          changeCoverage: 38.94,
          impactedFiles: mockImpactedFiles,
        },
      },
    },
  },
}

beforeAll(() => {
  server.listen()
  console.error = () => {}
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('IndirectChangesTab', () => {
  function setup({ overrideData } = {}) {
    server.use(
      graphql.query('Pull', (_, res, ctx) => {
        if (overrideData) {
          return res(ctx.status(200), ctx.data(overrideData))
        }

        return res(ctx.status(200), ctx.data(mockPull))
      })
    )
  }

  describe('when rendered with impacted files', () => {
    it('renders the impacted files component', async () => {
      setup()
      render(<IndirectChangesTab />, { wrapper })

      const indirectChangesTab = await screen.findByText(
        /IndirectChangedFiles Component/
      )
      expect(indirectChangesTab).toBeInTheDocument()
    })
  })

  describe('when rendered without changes', () => {
    beforeEach(() => {
      setup({
        overrideData: {
          owner: {
            repository: {
              pull: {
                pullId: 14,
                head: {
                  state: CommitStateEnum.COMPLETE,
                },
                compareWithBase: {
                  __typename: ComparisonReturnType.SUCCESSFUL_COMPARISON,
                  patchTotals: {
                    percentCovered: 92.12,
                  },
                  headTotals: {
                    percentCovered: 74.2,
                  },
                  baseTotals: {
                    percentCovered: 27.35,
                  },
                  changeCoverage: 38.94,
                  impactedFiles: [],
                },
              },
            },
          },
        },
      })
    })

    it('renders indirect changes info', async () => {
      render(<IndirectChangesTab />, { wrapper })

      const indirectChangesInfo = await screen.findByText(
        /These are files that didn't have author revisions, but contain unexpected coverage changes/
      )
      expect(indirectChangesInfo).toBeInTheDocument()
    })

    it('renders no change text', async () => {
      render(<IndirectChangesTab />, { wrapper })

      const noChangeText = await screen.findByText(
        /Everything is accounted for! No changes detected that need to be reviewed./
      )
      expect(noChangeText).toBeInTheDocument()
    })

    it('does not render IndirectChangedFiles component', () => {
      render(<IndirectChangesTab />, { wrapper })

      const indirectChangedFiles = screen.queryByText(
        'IndirectChangedFiles Component'
      )
      expect(indirectChangedFiles).not.toBeInTheDocument()
    })
  })

  describe('when rendered without impacted files or changes', () => {
    beforeEach(() => {
      setup({
        overrideData: {
          owner: {
            repository: {
              pull: {
                pullId: 14,
                head: {
                  state: CommitStateEnum.COMPLETE,
                },
                compareWithBase: {
                  __typename: ComparisonReturnType.SUCCESSFUL_COMPARISON,
                  impactedFiles: [],
                },
              },
            },
          },
        },
      })
    })

    it('renders no impacted files text', async () => {
      render(<IndirectChangesTab />, { wrapper })

      const noImpactedFilesText = await screen.findByText(
        'No Files covered by tests were changed'
      )
      expect(noImpactedFilesText).toBeInTheDocument()
    })

    it('does not render IndirectChangedFiles component', () => {
      render(<IndirectChangesTab />, { wrapper })

      const indirectChangedFiles = screen.queryByText(
        'IndirectChangedFiles Component'
      )
      expect(indirectChangedFiles).not.toBeInTheDocument()
    })
  })

  describe('when rendered with head commit errored out', () => {
    beforeEach(() => {
      setup({
        overrideData: {
          owner: {
            repository: {
              pull: {
                pullId: 14,
                head: {
                  state: CommitStateEnum.ERROR,
                },
                compareWithBase: null,
              },
            },
          },
        },
      })
    })

    it('renders no head commit error text', async () => {
      render(<IndirectChangesTab />, { wrapper })

      const noHeadCommitErrorText = await screen.findByText(
        'Cannot display Impacted Files because most recent commit is in an error state.'
      )
      expect(noHeadCommitErrorText).toBeInTheDocument()
    })
  })

  describe('when loading data', () => {
    it('shows loading spinner', async () => {
      setup()
      render(<IndirectChangesTab />, { wrapper })

      const spinner = screen.getByTestId('spinner')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('when comparison is of pull request type', () => {
    it('renders first PR copy', async () => {
      setup({
        overrideData: {
          owner: {
            repository: {
              pull: {
                pullId: 14,
                head: {
                  state: CommitStateEnum.COMPLETE,
                },
                compareWithBase: {
                  __typename: ComparisonReturnType.FIRST_PULL_REQUEST,
                },
              },
            },
          },
        },
      })
      render(<IndirectChangesTab />, { wrapper })

      const firstPullCopy = await screen.findByText(
        /No comparison made since it's your first commit with Codecov/
      )
      expect(firstPullCopy).toBeInTheDocument()
    })
  })
})
