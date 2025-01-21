import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

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
  isTeamPlan: boolean
  isPrivate?: boolean
}

describe('FilesChangedTab', () => {
  function setup({ isTeamPlan, isPrivate = false }: SetupArgs) {
    server.use(
      graphql.query('IsTeamPlan', () => {
        return HttpResponse.json({
          data: {
            owner: {
              plan: {
                isTeamPlan,
              },
            },
          },
        })
      }),
      graphql.query('GetRepoSettingsTeam', () => {
        return HttpResponse.json({ data: mockRepoSettings(isPrivate) })
      })
    )
  }

  beforeEach(() => {
    mocks.filesChangedTable.mockImplementation(() => 'FilesChangedTable')
  })

  describe('user has pro plan', () => {
    it('renders files changed table', async () => {
      setup({ isTeamPlan: false })
      render(<FilesChangedTab />, { wrapper })

      const table = await screen.findByText('FilesChangedTable')
      expect(table).toBeInTheDocument()
    })
  })

  describe('user has team plan', () => {
    describe('repo is private', () => {
      it('renders team files changed table', async () => {
        setup({ isTeamPlan: true, isPrivate: true })

        render(<FilesChangedTab />, { wrapper })

        const table = await screen.findByText('FilesChangedTableTeam')
        expect(table).toBeInTheDocument()
      })
    })

    describe('repo is public', () => {
      it('renders files changed table', async () => {
        setup({ isTeamPlan: true, isPrivate: false })
        render(<FilesChangedTab />, { wrapper })

        const table = await screen.findByText('FilesChangedTable')
        expect(table).toBeInTheDocument()
      })
    })
  })
})
