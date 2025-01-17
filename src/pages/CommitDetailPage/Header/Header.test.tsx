import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

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
  isTeamPlan: boolean
  isPrivate?: boolean
}

describe('Header', () => {
  function setup({ isTeamPlan = false, isPrivate = false }: SetupArgs) {
    server.use(
      graphql.query('IsTeamPlan', () => {
        if (isTeamPlan) {
          return HttpResponse.json({
            data: { owner: { plan: { isTeamPlan: true } } },
          })
        }
        return HttpResponse.json({
          data: { owner: { plan: { isTeamPlan: false } } },
        })
      }),
      graphql.query('GetRepoSettingsTeam', () => {
        return HttpResponse.json({ data: mockRepoSettings(isPrivate) })
      })
    )
  }

  describe('when rendered and customer is not team plan', () => {
    beforeEach(() => {
      setup({ isTeamPlan: false })
    })

    it('renders the default header component', async () => {
      render(<Header />, { wrapper })

      const defaultHeader = await screen.findByText(/Default Header/)
      expect(defaultHeader).toBeInTheDocument()

      const teamHeader = screen.queryByText(/Team Header/)
      expect(teamHeader).not.toBeInTheDocument()
    })
  })

  describe('when rendered and customer has team plan', () => {
    describe('when the repository is private', () => {
      beforeEach(() => {
        setup({ isTeamPlan: true, isPrivate: true })
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
        setup({ isTeamPlan: true, isPrivate: false })
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
