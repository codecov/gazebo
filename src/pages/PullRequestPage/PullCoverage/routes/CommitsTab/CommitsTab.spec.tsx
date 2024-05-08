import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'

import CommitsTab from './CommitsTab'

jest.mock('./CommitsTable', () => () => 'CommitsTable')
jest.mock('./CommitsTableTeam', () => () => 'CommitsTableTeam')

const mockCommitTeamResponse = {
  owner: {
    repository: {
      __typename: 'Repository',
      commits: {
        edges: [
          {
            node: {
              ciPassed: true,
              message: 'commit message 1',
              commitid: 'fdb5b182241cfdc8d8a8dd1c6f98d1259f522b9c',
              createdAt: '2023-10-11T00:00.000000',
              author: {
                username: 'codecov-user',
                avatarUrl: 'http://127.0.0.1/avatar-url',
              },
              compareWithParent: {
                __typename: 'Comparison',
                patchTotals: {
                  percentCovered: 80,
                },
              },
            },
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
      },
    },
  },
}

const mockRepoSettings = (isPrivate = false) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      defaultBranch: 'master',
      private: isPrivate,
      uploadToken: 'token',
      profilingToken: 'token',
      staticAnalysisToken: 'static analysis token',
      graphToken: 'token',
      yaml: 'yaml',
      bot: {
        username: 'test',
      },
      activated: true,
    },
  },
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo/pull/1234/commits']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId/commits">
        {children}
      </Route>
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

interface setupArgs {
  tierValue?: string
  isPrivate?: boolean
}

describe('CommitsTab', () => {
  function setup(
    { tierValue = TierNames.PRO, isPrivate = false }: setupArgs = {
      tierValue: TierNames.PRO,
      isPrivate: false,
    }
  ) {
    server.use(
      graphql.query('GetRepoSettingsTeam', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoSettings(isPrivate)))
      }),
      graphql.query('OwnerTier', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: { plan: { tierName: tierValue } },
          })
        )
      }),
      graphql.query('GetCommitsTeam', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockCommitTeamResponse))
      })
    )
  }

  it('renders commits table', async () => {
    setup()
    render(<CommitsTab />, { wrapper })

    const table = await screen.findByText('CommitsTable')
    expect(table).toBeInTheDocument()
  })

  describe('user has a team plan', () => {
    describe('repo is public', () => {
      it('renders the commits table', async () => {
        setup({ tierValue: TierNames.TEAM, isPrivate: false })
        render(<CommitsTab />, { wrapper })

        const table = await screen.findByText('CommitsTable')
        expect(table).toBeInTheDocument()
      })
    })

    describe('repo is private', () => {
      it('renders the commits table team', async () => {
        setup({ tierValue: TierNames.TEAM, isPrivate: true })
        render(<CommitsTab />, { wrapper })

        const table = await screen.findByText('CommitsTableTeam')
        expect(table).toBeInTheDocument()
      })
    })
  })
})
