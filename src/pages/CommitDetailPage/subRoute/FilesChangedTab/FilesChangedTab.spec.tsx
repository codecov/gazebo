import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'
import { useFlags } from 'shared/featureFlags'

import FilesChangedTab from './FilesChangedTab'

jest.mock('./FilesChangedTable', () => () => 'FilesChangedTable')
jest.mock('./FilesChangedTableTeam', () => () => 'FilesChangedTableTeam')

jest.mock('shared/featureFlags')
const mockedUseFlags = useFlags as jest.Mock<{
  multipleTiers: boolean
  componentsSelect: boolean
}>

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

const mockRepoSettings = (isPrivate: boolean) => ({
  owner: {
    repository: {
      defaultBranch: 'master',
      private: isPrivate,
      uploadToken: 'token',
      graphToken: 'token',
      yaml: 'yaml',
      bot: {
        username: 'test',
      },
    },
  },
})

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
  planValue: 'team' | 'pro'
  flagValue: boolean
  isPrivate?: boolean
}

describe('FilesChangedTab', () => {
  function setup({ planValue, flagValue, isPrivate = false }: SetupArgs) {
    mockedUseFlags.mockReturnValue({
      multipleTiers: flagValue,
      componentsSelect: true,
    })

    server.use(
      graphql.query('OwnerTier', (req, res, ctx) => {
        if (planValue === 'team') {
          return res(ctx.status(200), ctx.data(mockTeamTier))
        }

        return res(ctx.status(200), ctx.data(mockProTier))
      }),
      graphql.query('GetRepoSettingsTeam', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoSettings(isPrivate)))
      })
    )
  }

  describe('user has pro tier', () => {
    it('renders files changed table', async () => {
      setup({ planValue: TierNames.PRO, flagValue: false })
      render(<FilesChangedTab />, { wrapper })

      const table = await screen.findByText('FilesChangedTable')
      expect(table).toBeInTheDocument()
    })
  })

  describe('user has team tier', () => {
    describe('repo is private', () => {
      it('renders team files changed table', async () => {
        setup({ planValue: TierNames.TEAM, flagValue: true, isPrivate: true })

        render(<FilesChangedTab />, { wrapper })

        const table = await screen.findByText('FilesChangedTableTeam')
        expect(table).toBeInTheDocument()
      })
    })

    describe('repo is public', () => {
      it('renders files changed table', async () => {
        setup({ planValue: TierNames.TEAM, flagValue: false, isPrivate: false })
        render(<FilesChangedTab />, { wrapper })

        const table = await screen.findByText('FilesChangedTable')
        expect(table).toBeInTheDocument()
      })
    })
  })
})
