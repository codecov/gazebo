import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'

import FilesChangedTab from './FilesChangedTab'

const mocks = vi.hoisted(() => {
  return {
    filesChangedTable: vi.fn(),
  }
})

vi.mock('./FilesChangedTable', () => ({
  default: mocks.filesChangedTable,
}))
vi.mock('./FilesChangedTableTeam', () => ({
  default: () => 'FilesChangedTableTeam',
}))

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
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      defaultBranch: 'master',
      private: isPrivate,
      uploadToken: 'token',
      graphToken: 'token',
      yaml: 'yaml',
      bot: {
        username: 'test',
      },
      activated: true,
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
  isPrivate?: boolean
}

describe('FilesChangedTab', () => {
  function setup({ planValue, isPrivate = false }: SetupArgs) {
    server.use(
      graphql.query('OwnerTier', (info) => {
        if (planValue === 'team') {
          return HttpResponse.json({ data: mockTeamTier })
        }

        return HttpResponse.json({ data: mockProTier })
      }),
      graphql.query('GetRepoSettingsTeam', (info) => {
        return HttpResponse.json({ data: mockRepoSettings(isPrivate) })
      })
    )
  }

  beforeEach(() => {
    mocks.filesChangedTable.mockImplementation(() => 'FilesChangedTable')
  })

  describe('user has pro tier', () => {
    it('renders files changed table', async () => {
      setup({ planValue: TierNames.PRO })
      render(<FilesChangedTab />, { wrapper })

      const table = await screen.findByText('FilesChangedTable')
      expect(table).toBeInTheDocument()
    })
  })

  describe('user has team tier', () => {
    describe('repo is private', () => {
      it('renders team files changed table', async () => {
        setup({ planValue: TierNames.TEAM, isPrivate: true })

        render(<FilesChangedTab />, { wrapper })

        const table = await screen.findByText('FilesChangedTableTeam')
        expect(table).toBeInTheDocument()
      })
    })

    describe('repo is public', () => {
      it('renders files changed table', async () => {
        setup({ planValue: TierNames.TEAM, isPrivate: false })
        render(<FilesChangedTab />, { wrapper })

        const table = await screen.findByText('FilesChangedTable')
        expect(table).toBeInTheDocument()
      })
    })
  })
})
