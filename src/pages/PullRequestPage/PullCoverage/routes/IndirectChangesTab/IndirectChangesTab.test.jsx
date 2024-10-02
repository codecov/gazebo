import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { CommitStateEnum, UploadTypeEnum } from 'shared/utils/commit'
import { ComparisonReturnType } from 'shared/utils/comparison'
import { ImpactedFilesReturnType } from 'shared/utils/impactedFiles'

import IndirectChangesTab from './IndirectChangesTab'

vi.mock('./IndirectChangedFiles/IndirectChangedFiles', () => ({
  default: () => 'IndirectChangedFiles Component',
}))

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
    missesCount: 3,
    fileName: 'mafs.js',
    headName: 'flag1/mafs.js',
    baseCoverage: {
      percentCovered: 45.38,
    },
    headCoverage: {
      percentCovered: 90.23,
    },
    patchCoverage: {
      percentCovered: 27.43,
    },
    changeCoverage: 41,
  },
]

const mockPull = ({ overrideComparison, headState } = {}) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      defaultBranch: 'main',
      private: false,
      pull: {
        commits: {
          edges: [
            {
              node: {
                state: 'complete',
                commitid: 'fc43199ccde1f21a940aa3d596c711c1c420651f',
                message:
                  'create component to hold bundle list table for a given pull 2',
                author: {
                  username: 'nicholas-codecov',
                },
              },
            },
          ],
        },
        compareWithBase: overrideComparison
          ? overrideComparison
          : {
              state: 'complete',
              __typename: 'Comparison',
              flagComparisons: [],
              patchTotals: {
                percentCovered: 92.12,
              },
              baseTotals: {
                percentCovered: 98.25,
              },
              headTotals: {
                percentCovered: 78.33,
              },
              impactedFiles: {
                __typename: 'ImpactedFiles',
                results: mockImpactedFiles,
              },
              changeCoverage: 38.94,
              hasDifferentNumberOfHeadAndBaseReports: true,
            },
        pullId: 2510,
        title: 'feat: Create bundle analysis table for a given pull',
        state: 'OPEN',
        author: {
          username: 'nicholas-codecov',
        },
        head: {
          ciPassed: true,
          branchName:
            'gh-eng-994-create-bundle-analysis-table-for-a-given-pull',
          state: headState ? headState : 'complete',
          commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
          totals: {
            percentCovered: 78.33,
          },
          uploads: {
            totalCount: 4,
            edges: [
              {
                node: {
                  uploadType: UploadTypeEnum.CARRIED_FORWARD,
                  flags: ['flag3'],
                },
              },
              {
                node: {
                  uploadType: UploadTypeEnum.UPLOADED,
                  flags: ['flag7'],
                },
              },
              {
                node: {
                  uploadType: UploadTypeEnum.UPLOADED,
                  flags: ['flag7'],
                },
              },
              {
                node: {
                  uploadType: UploadTypeEnum.UPLOADED,
                  flags: ['flag7'],
                },
              },
            ],
          },
        },
        updatestamp: '2024-01-12T12:56:18.912860',
        behindBy: 82367894,
        behindByCommit: '1798hvs8ofhn',
        comparedTo: {
          commitid: '2d6c42fe217c61b007b2c17544a9d85840381857',
          uploads: {
            totalCount: 1,
            edges: [
              {
                node: {
                  uploadType: UploadTypeEnum.CARRIED_FORWARD,
                  flags: ['flag3'],
                },
              },
            ],
          },
        },
      },
    },
  },
})

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
  function setup({ overrideComparison, headState } = {}) {
    server.use(
      graphql.query('Pull', (info) => {
        return HttpResponse.json({
          data: mockPull({ overrideComparison, headState }),
        })
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
        overrideComparison: {
          ...mockPull().owner.repository.pull.compareWithBase,
          impactedFiles: {
            __typename: ImpactedFilesReturnType.IMPACTED_FILES,
            results: [],
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
        overrideComparison: {
          state: 'complete',
          __typename: 'MissingHeadCommit',
          message: 'No head commit found',
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
        headState: CommitStateEnum.ERROR,
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
        overrideComparison: {
          __typename: ComparisonReturnType.FIRST_PULL_REQUEST,
          message: 'First pull request',
        },
      })
      render(<IndirectChangesTab />, { wrapper })

      const firstPullCopy = await screen.findByText(
        /No comparison made since it's your first commit with Codecov/
      )
      expect(firstPullCopy).toBeInTheDocument()
    })
  })

  describe('unknown flag status', () => {
    it('Displays server message + suggests carryforward flags', async () => {
      const overrideComparison = {
        state: 'complete',
        __typename: 'Comparison',
        flagComparisons: [],
        patchTotals: {
          percentCovered: 92.12,
        },
        baseTotals: {
          percentCovered: 98.25,
        },
        headTotals: {
          percentCovered: 78.33,
        },
        impactedFiles: {
          __typename: ImpactedFilesReturnType.UNKNOWN_FLAGS,
          message: 'Unkown flags detected',
        },
        changeCoverage: 38.94,
        hasDifferentNumberOfHeadAndBaseReports: true,
      }

      setup({
        overrideComparison,
      })

      render(<IndirectChangesTab />, { wrapper })

      const serverMessage = await screen.findByText(
        /No coverage report uploaded for the selected flags in this pull request's head commit./
      )
      expect(serverMessage).toBeInTheDocument()
    })
  })
})
