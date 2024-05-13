import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'
import { useFlags } from 'shared/featureFlags'

import FilesChangedTab from './FilesChangedTab'

jest.mock('./FilesChanged', () => () => 'FilesChanged')
jest.mock('./FilesChanged/TableTeam', () => () => 'TeamFilesChanged')
jest.mock('../ComponentsSelector', () => () => 'ComponentsSelector')

jest.mock('shared/featureFlags')
const mockedUseFlags = useFlags as jest.Mock<{ multipleTiers: boolean }>

const mockTeamTier = {
  owner: {
    plan: {
      tierName: TierNames.TEAM,
    },
  },
}

const mockProTier = {
  owner: {
    plan: {
      tierName: TierNames.PRO,
    },
  },
}

const mockCompareData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        pullId: 10,
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

const mockOverview = {
  owner: {
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: false,
      languages: ['javascript'],
    },
  },
}

const server = setupServer()
const queryClient = new QueryClient()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/test-repo/commit/sha256']}>
      <Route path="/:provider/:owner/:repo/commit/:commit">{children}</Route>
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

afterAll(() => {
  server.close()
})

interface SetupArgs {
  planValue: (typeof TierNames)[keyof typeof TierNames]
  multipleTiers: boolean
  privateRepo: boolean
}

describe('FilesChangedTab', () => {
  function setup({ planValue, multipleTiers, privateRepo }: SetupArgs) {
    mockedUseFlags.mockReturnValue({
      multipleTiers: multipleTiers,
    })

    server.use(
      graphql.query('OwnerTier', (req, res, ctx) => {
        if (planValue === TierNames.TEAM) {
          return res(ctx.status(200), ctx.data(mockTeamTier))
        }

        return res(ctx.status(200), ctx.data(mockProTier))
      }),
      graphql.query('GetPullTeam', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockCompareData))
      ),
      graphql.query('GetRepoSettingsTeam', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                __typename: 'Repository',
                activated: true,
                defaultBranch: 'master',
                private: privateRepo,
                uploadToken: 'upload token',
                graphToken: 'graph token',
                yaml: 'yaml',
                bot: {
                  username: 'test',
                },
              },
            },
          })
        )
      ),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockOverview))
      })
    )
  }

  describe.each`
    multipleTiers | planValue          | privateRepo
    ${true}       | ${TierNames.BASIC} | ${true}
    ${true}       | ${TierNames.BASIC} | ${false}
    ${true}       | ${TierNames.TEAM}  | ${false}
    ${false}      | ${TierNames.BASIC} | ${true}
    ${false}      | ${TierNames.BASIC} | ${false}
    ${false}      | ${TierNames.TEAM}  | ${true}
    ${false}      | ${TierNames.TEAM}  | ${false}
  `(
    'renders the full files changed table',
    ({ multipleTiers, planValue, privateRepo }) => {
      it(`multipleTiers: ${multipleTiers}, planValue: ${planValue}, privateRepo: ${privateRepo}`, async () => {
        setup({ multipleTiers, planValue, privateRepo })
        render(<FilesChangedTab />, { wrapper })

        const table = await screen.findByText('FilesChanged')
        expect(table).toBeInTheDocument()
      })
    }
  )

  describe.each`
    multipleTiers | planValue         | privateRepo
    ${true}       | ${TierNames.TEAM} | ${true}
  `(
    'renders the team files changed table',
    ({ multipleTiers, planValue, privateRepo }) => {
      it(`multipleTiers: ${multipleTiers}, planValue: ${planValue}, privateRepo: ${privateRepo}`, async () => {
        setup({ multipleTiers, planValue, privateRepo })
        render(<FilesChangedTab />, { wrapper })

        const table = await screen.findByText('TeamFilesChanged')
        expect(table).toBeInTheDocument()
      })
    }
  )

  describe('when impacted files is rendered', () => {
    it('renders ComponentsSelector', async () => {
      setup({
        multipleTiers: true,
        planValue: TierNames.BASIC,
        privateRepo: true,
      })
      render(<FilesChangedTab />, { wrapper })

      const selector = await screen.findByText('ComponentsSelector')
      expect(selector).toBeInTheDocument()
    })
  })
})
