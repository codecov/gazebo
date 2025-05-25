import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { PullComparison } from 'services/pull/usePull'
import { UploadTypeEnum } from 'shared/utils/commit'

import FlagsTab from './FlagsTab'

const mockImpactedFiles = [
  {
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

const mockPull = ({
  overrideComparison,
}: {
  overrideComparison?: PullComparison
} = {}) => ({
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
                state: 'PROCESSED',
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
              state: 'PROCESSED',
              __typename: 'Comparison',
              flagComparisons: [],
              patchTotals: {
                percentCovered: 92.12,
              },
              baseTotals: {
                percentCovered: 27.35,
              },
              headTotals: {
                percentCovered: 74.2,
              },
              impactedFiles: {
                __typename: 'ImpactedFiles',
                results: mockImpactedFiles,
              },
              changeCoverage: 38.94,
              hasDifferentNumberOfHeadAndBaseReports: true,
            },
        pullId: 14,
        title: 'feat: Create bundle analysis table for a given pull',
        state: 'OPEN',
        author: {
          username: 'nicholas-codecov',
        },
        head: {
          ciPassed: true,
          branchName:
            'gh-eng-994-create-bundle-analysis-table-for-a-given-pull',
          state: 'PROCESSED',
          commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
          coverageAnalytics: {
            totals: {
              percentCovered: 78.33,
            },
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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/test-org/test-repo/pull/5']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('FlagsTab', () => {
  function setup({
    overrideComparison,
  }: { overrideComparison?: PullComparison } = {}) {
    const variablesPassed = vi.fn()
    server.use(
      graphql.query('Pull', (info) => {
        variablesPassed(info.variables)
        return HttpResponse.json({ data: mockPull({ overrideComparison }) })
      })
    )

    return { variablesPassed }
  }

  describe('when rendered without flags', () => {
    beforeEach(() => {
      setup({
        overrideComparison: {
          state: 'PROCESSED',
          __typename: 'Comparison',
          flagComparisons: [],
          patchTotals: {
            percentCovered: 92.12,
          },
          baseTotals: {
            percentCovered: 27.35,
          },
          headTotals: {
            percentCovered: 74.2,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: mockImpactedFiles,
          },
          changeCoverage: 38.94,
          hasDifferentNumberOfHeadAndBaseReports: true,
        },
      })
    })

    it('renders not configured message', async () => {
      render(<FlagsTab />, { wrapper })

      const flagsDescription = await screen.findByText(
        /The Flags feature is not yet configured/i
      )
      expect(flagsDescription).toBeInTheDocument()

      const flagsAnchor = await screen.findByRole('link', {
        name: /help your team today/i,
      })
      expect(flagsAnchor).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/flags'
      )
      expect(flagsDescription).toBeInTheDocument()

      const flagsMarketingImg = await screen.findByRole('img', {
        name: /Flags feature not configured/,
      })
      expect(flagsMarketingImg).toBeInTheDocument()
      expect(flagsMarketingImg).toHaveAttribute(
        'src',
        '/src/assets/flagManagement.svg'
      )
      expect(flagsMarketingImg).toHaveAttribute(
        'alt',
        'Flags feature not configured'
      )
    })
  })

  describe('when rendered with populated data', () => {
    beforeEach(() => {
      setup({
        overrideComparison: {
          state: 'PROCESSED',
          __typename: 'Comparison',
          flagComparisons: [
            {
              name: 'secondTest',
              headTotals: {
                percentCovered: 82.71,
              },
              baseTotals: {
                percentCovered: 80.0,
              },
              patchTotals: {
                percentCovered: 59.0,
              },
            },
          ],
          patchTotals: {
            percentCovered: 92.12,
          },
          baseTotals: {
            percentCovered: 27.35,
          },
          headTotals: {
            percentCovered: 74.2,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: mockImpactedFiles,
          },
          changeCoverage: 38.94,
          hasDifferentNumberOfHeadAndBaseReports: true,
        },
      })
    })

    it('renders columns with expected data', async () => {
      render(<FlagsTab />, { wrapper })

      const flagsCardTitle = screen.queryByText('FlagsTab')
      expect(flagsCardTitle).not.toBeInTheDocument()

      const nameTableField = await screen.findByText(`Name`)
      expect(nameTableField).toBeInTheDocument()

      const headTableField = await screen.findByText(`HEAD %`)
      expect(headTableField).toBeInTheDocument()

      const patchTableField = await screen.findByText(`Patch %`)
      expect(patchTableField).toBeInTheDocument()

      const changeTableField = await screen.findByText(`Change %`)
      expect(changeTableField).toBeInTheDocument()

      const flagName = await screen.findByText('secondTest')
      expect(flagName).toBeInTheDocument()

      const flagHeadCoverage = await screen.findByText('82.71%')
      expect(flagHeadCoverage).toBeInTheDocument()

      const flagPatchCoverage = await screen.findByText('59.00%')
      expect(flagPatchCoverage).toBeInTheDocument()

      const flagChangeCoverage = await screen.findByText('2.71%')
      expect(flagChangeCoverage).toBeInTheDocument()
    })
  })
})
