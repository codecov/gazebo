import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'
import { useFlags } from 'shared/featureFlags'

import GeneralTab from './GeneralTab'

jest.mock('./Tokens/TokensTeam', () => () => 'Tokens Team Component')
jest.mock('./Tokens/Tokens', () => () => 'Tokens Component')
jest.mock('./DangerZone', () => () => 'DangerZone Component')
jest.mock('shared/featureFlags')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings']}>
      <Route path="/:provider/:owner/:repo/settings">{children}</Route>
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
  function setup({
    uploadToken,
    defaultBranch,
    profilingToken,
    graphToken,
    multipleTiers,
  }) {
    useFlags.mockReturnValue({
      multipleTiers,
    })

    server.use(
      graphql.query('GetRepoSettings', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                uploadToken,
                defaultBranch,
                profilingToken,
                graphToken,
              },
            },
          })
        )
      }),
      graphql.query('GetBranches', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({}))
      }),
      graphql.query('CurrentUser', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({}))
      }),
      graphql.query('OwnerTier', (req, res, ctx) => {
        if (multipleTiers) {
          return res(
            ctx.status(200),
            ctx.data({ owner: { plan: { tierName: TierNames.TEAM } } })
          )
        }
        return res(ctx.status(200), ctx.data({ tierName: TierNames.PRO }))
      })
    )
  }

  describe('when rendered', () => {
    describe('when rendered with defaultBranch', () => {
      beforeEach(() => {
        setup({ defaultBranch: 'master' })
      })

      it('renders Default Branch component', async () => {
        render(<GeneralTab />, { wrapper })

        const title = await screen.findByText(/Default Branch/)
        expect(title).toBeInTheDocument()
      })
    })

    describe('when rendered with no defaultBranch', () => {
      beforeEach(() => {
        setup({ defaultBranch: null })
      })

      it('does not render  Default Branch component', () => {
        render(<GeneralTab />, { wrapper })

        const title = screen.queryByText(/Default Branch/)
        expect(title).not.toBeInTheDocument()
      })
    })

    it('render tokens component', () => {
      setup({ multipleTiers: false })
      render(<GeneralTab />, { wrapper })

      const tokensComponent = screen.getByText(/Tokens Component/)
      expect(tokensComponent).toBeInTheDocument()
    })

    it('render danger zone component', () => {
      setup({ multipleTiers: false })
      render(<GeneralTab />, { wrapper })

      const tokensComponent = screen.getByText(/DangerZone Component/)
      expect(tokensComponent).toBeInTheDocument()
    })
  })

  describe('when rendered with team tier', () => {
    beforeEach(() => {
      setup({ multipleTiers: true })
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
})
