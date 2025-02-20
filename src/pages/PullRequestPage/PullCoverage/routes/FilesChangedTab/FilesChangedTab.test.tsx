import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import FilesChangedTab from './FilesChangedTab'

vi.mock('./FilesChanged', () => ({ default: () => 'FilesChanged' }))
vi.mock('./FilesChanged/TableTeam', () => ({
  default: () => 'TeamFilesChanged',
}))
vi.mock('../ComponentsSelector', () => ({
  default: () => 'ComponentsSelector',
}))

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
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: false,
      languages: ['javascript'],
      testAnalyticsEnabled: true,
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
  isTeamPlan: boolean
  privateRepo: boolean
}

describe('FilesChangedTab', () => {
  function setup({ isTeamPlan, privateRepo }: SetupArgs) {
    server.use(
      graphql.query('IsTeamPlan', () => {
        return HttpResponse.json({ data: { owner: { plan: { isTeamPlan } } } })
      }),
      graphql.query('GetPullTeam', () => {
        return HttpResponse.json({ data: mockCompareData })
      }),
      graphql.query('GetRepoSettingsTeam', () => {
        return HttpResponse.json({
          data: {
            owner: {
              isCurrentUserPartOfOrg: true,
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
          },
        })
      }),
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({ data: mockOverview })
      })
    )
  }

  describe.each`
    isTeamPlan | privateRepo
    ${false}   | ${true}
    ${false}   | ${false}
    ${true}    | ${false}
  `('renders the full files changed table', ({ isTeamPlan, privateRepo }) => {
    it(`isTeamPlan: ${isTeamPlan}, privateRepo: ${privateRepo}`, async () => {
      setup({ isTeamPlan, privateRepo })
      render(<FilesChangedTab />, { wrapper })

      const table = await screen.findByText('FilesChanged')
      expect(table).toBeInTheDocument()
    })
  })

  describe.each`
    isTeamPlan | privateRepo
    ${true}    | ${true}
  `('renders the team files changed table', ({ isTeamPlan, privateRepo }) => {
    it(`isTeamPlan: ${isTeamPlan}, privateRepo: ${privateRepo}`, async () => {
      setup({ isTeamPlan, privateRepo })
      render(<FilesChangedTab />, { wrapper })

      const table = await screen.findByText('TeamFilesChanged')
      expect(table).toBeInTheDocument()
    })
  })

  describe('when impacted files is rendered', () => {
    it('renders ComponentsSelector', async () => {
      setup({
        isTeamPlan: false,
        privateRepo: true,
      })
      render(<FilesChangedTab />, { wrapper })

      const selector = await screen.findByText('ComponentsSelector')
      expect(selector).toBeInTheDocument()
    })
  })
})
