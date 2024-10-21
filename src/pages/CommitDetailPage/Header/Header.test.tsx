import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'

import Header from './Header'

vi.mock('./HeaderDefault', () => ({ default: () => 'Default Header' }))
vi.mock('./HeaderTeam', () => ({ default: () => 'Team Header' }))

const mockRepoSettings = (isPrivate = false) => ({
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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/test-repo/commit/id-1']}>
      <Route path="/:provider/:owner/:repo/commit/:commit">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())
interface SetupArgs {
  teamPlan: boolean
  isPrivate?: boolean
}

describe('Header', () => {
  function setup({ teamPlan = false, isPrivate = false }: SetupArgs) {
    server.use(
      graphql.query('OwnerTier', (info) => {
        if (teamPlan) {
          return HttpResponse.json({
            data: { owner: { plan: { tierName: TierNames.TEAM } } },
          })
        }
        return HttpResponse.json({
          data: { owner: { plan: { tierName: TierNames.PRO } } },
        })
      }),
      graphql.query('GetRepoSettingsTeam', (info) => {
        return HttpResponse.json({ data: mockRepoSettings(isPrivate) })
      })
    )
  }

  describe('when rendered and customer is not team tier', () => {
    beforeEach(() => {
      setup({ teamPlan: false })
    })

    it('renders the default header component', async () => {
      render(<Header />, { wrapper })

      const defaultHeader = await screen.findByText(/Default Header/)
      expect(defaultHeader).toBeInTheDocument()

      const teamHeader = screen.queryByText(/Team Header/)
      expect(teamHeader).not.toBeInTheDocument()
    })
  })

  describe('when rendered and customer has team tier', () => {
    describe('when the repository is private', () => {
      beforeEach(() => {
        setup({ teamPlan: true, isPrivate: true })
      })

      it('renders the team header component', async () => {
        render(<Header />, { wrapper })

        const teamHeader = await screen.findByText(/Team Header/)
        expect(teamHeader).toBeInTheDocument()

        const defaultHeader = screen.queryByText(/Default Header/)
        expect(defaultHeader).not.toBeInTheDocument()
      })
    })

    describe('when the repository is public', () => {
      beforeEach(() => {
        setup({ teamPlan: true, isPrivate: false })
      })

      it('renders the default team component', async () => {
        render(<Header />, { wrapper })

        const defaultHeader = await screen.findByText(/Default Header/)
        expect(defaultHeader).toBeInTheDocument()

        const teamHeader = screen.queryByText(/Team Header/)
        expect(teamHeader).not.toBeInTheDocument()
      })
    })
  })
})
