import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'

import GeneralTab from './GeneralTab'

vi.mock('./Tokens/TokensTeam', () => ({
  default: () => 'Tokens Team Component',
}))
vi.mock('./Tokens/Tokens', () => ({
  default: () => 'Tokens Component',
}))
vi.mock('./DangerZone', () => ({
  default: () => 'DangerZone Component',
}))
vi.mock('./DefaultBranch', () => ({
  default: () => 'Default Branch',
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/codecov-client/config']}>
      <Route path="/:provider/:owner/:repo/config">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
  console.error = () => {}
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('GeneralTab', () => {
  function setup(
    {
      hasDefaultBranch = false,
      tierValue = TierNames.PRO,
      isPrivate = false,
    } = {
      hasDefaultBranch: false,
      tierValue: TierNames.PRO,
    }
  ) {
    server.use(
      graphql.query('RepoDataTokensTeam', (info) => {
        if (hasDefaultBranch) {
          return HttpResponse.json({
            data: {
              owner: {
                repository: {
                  __typename: 'Repository',
                  defaultBranch: 'main',
                  private: isPrivate,
                },
              },
            },
          })
        }
        return HttpResponse.json({
          data: {
            owner: {
              repository: {
                __typename: 'Repository',
                defaultBranch: null,
                private: isPrivate,
              },
            },
          },
        })
      }),
      graphql.query('OwnerTier', (info) => {
        if (tierValue === TierNames.TEAM) {
          return HttpResponse.json({
            data: { owner: { plan: { tierName: TierNames.TEAM } } },
          })
        }
        return HttpResponse.json({
          data: { owner: { plan: { tierName: TierNames.PRO } } },
        })
      })
    )
  }

  describe('when rendered', () => {
    describe('when rendered with defaultBranch', () => {
      beforeEach(() => {
        setup({ hasDefaultBranch: true })
      })

      it('renders Default Branch component', async () => {
        render(<GeneralTab />, { wrapper })

        const title = await screen.findByText(/Default Branch/)
        expect(title).toBeInTheDocument()
      })
    })

    describe('when rendered with no defaultBranch', () => {
      beforeEach(() => {
        setup({ hasDefaultBranch: false })
      })

      it('does not render  Default Branch component', () => {
        render(<GeneralTab />, { wrapper })

        const title = screen.queryByText(/Default Branch/)
        expect(title).not.toBeInTheDocument()
      })
    })

    it('render tokens component', () => {
      setup({ tierValue: TierNames.TEAM })
      render(<GeneralTab />, { wrapper })

      const tokensComponent = screen.getByText(/Tokens Component/)
      expect(tokensComponent).toBeInTheDocument()
    })

    it('render danger zone component', () => {
      setup({ tierValue: TierNames.TEAM })
      render(<GeneralTab />, { wrapper })

      const tokensComponent = screen.getByText(/DangerZone Component/)
      expect(tokensComponent).toBeInTheDocument()
    })
  })

  describe('when rendered with team tier', () => {
    describe('when the repository is private', () => {
      beforeEach(() => {
        setup({ tierValue: TierNames.TEAM, isPrivate: true })
      })

      it('render tokens team component', async () => {
        render(<GeneralTab />, { wrapper })

        const tokensComponent = await screen.findByText(/Tokens Team Component/)
        expect(tokensComponent).toBeInTheDocument()
      })

      it('render danger zone component', () => {
        render(<GeneralTab />, { wrapper })

        const tokensComponent = screen.getByText(/DangerZone Component/)
        expect(tokensComponent).toBeInTheDocument()
      })
    })

    describe('when the repository is public', () => {
      beforeEach(() => {
        setup({ tierValue: TierNames.TEAM, isPrivate: false })
      })

      it('render tokens component', () => {
        render(<GeneralTab />, { wrapper })

        const tokensComponent = screen.getByText(/Tokens Component/)
        expect(tokensComponent).toBeInTheDocument()
      })

      it('render danger zone component', () => {
        render(<GeneralTab />, { wrapper })

        const tokensComponent = screen.getByText(/DangerZone Component/)
        expect(tokensComponent).toBeInTheDocument()
      })
    })
  })
})
