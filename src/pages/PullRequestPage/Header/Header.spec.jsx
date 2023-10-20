import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'
import { useFlags } from 'shared/featureFlags'

import Header from './Header'

jest.mock('./HeaderDefault', () => () => 'Default Header')
jest.mock('./HeaderTeam', () => () => 'Team Header')
jest.mock('shared/featureFlags')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/test-org/test-repo/pull/12']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
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

describe('Header', () => {
  function setup({ multipleTiers = false } = { multipleTiers: false }) {
    useFlags.mockReturnValue({
      multipleTiers,
    })

    server.use(
      graphql.query('OwnerTier', (req, res, ctx) => {
        if (multipleTiers) {
          return res(
            ctx.status(200),
            ctx.data({ owner: { plan: { tierName: TierNames.TEAM } } })
          )
        }
        return res(
          ctx.status(200),
          ctx.data({ owner: { plan: { tierName: TierNames.PRO } } })
        )
      })
    )
  }

  describe('when rendered and customer is not team tier', () => {
    beforeEach(() => {
      setup({ multipleTiers: false })
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
    beforeEach(() => {
      setup({ multipleTiers: true })
    })

    it('renders the team header component', async () => {
      render(<Header />, { wrapper })

      const teamHeader = await screen.findByText(/Team Header/)
      expect(teamHeader).toBeInTheDocument()

      const defaultHeader = screen.queryByText(/Default Header/)
      expect(defaultHeader).not.toBeInTheDocument()
    })
  })
})
