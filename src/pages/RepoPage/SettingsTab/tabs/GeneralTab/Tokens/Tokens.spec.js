import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'
import { useFlags } from 'shared/featureFlags'

import Tokens from './Tokens'

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

describe('Tokens', () => {
  function setup(
    { showStaticAnalysis = true, multipleTiers = false } = {
      showStaticAnalysis: true,
      multipleTiers: false,
    }
  ) {
    useFlags.mockReturnValue({
      staticAnalysisToken: showStaticAnalysis,
      multipleTiers,
    })

    server.use(
      graphql.query('GetRepoSettings', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                uploadToken: 'upload token',
                profilingToken: 'profiling token',
                staticAnalysisToken: 'static analysis token',
                graphToken: 'graph token',
              },
            },
          })
        )
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
    beforeEach(() => {
      setup()
    })

    it('renders Repository upload token component', async () => {
      render(<Tokens />, { wrapper })

      const title = await screen.findByText(/Repository upload token/)
      expect(title).toBeInTheDocument()
    })

    it('renders impact analysis component', async () => {
      render(<Tokens />, { wrapper })

      const title = await screen.findByText(/Impact analysis token/)
      expect(title).toBeInTheDocument()
    })

    it('renders graph token component', async () => {
      render(<Tokens />, { wrapper })

      const title = await screen.findByText(/Graphing token/)
      expect(title).toBeInTheDocument()
    })

    it('renders static token component', async () => {
      render(<Tokens />, { wrapper })

      const title = await screen.findByText(/Static analysis token/)
      expect(title).toBeInTheDocument()
    })
  })

  describe('when static analysis flag is disabled', () => {
    beforeEach(() => {
      setup({ showStaticAnalysis: false })
    })

    it('does not render static token component', () => {
      render(<Tokens />, { wrapper })

      const title = screen.queryByText(/Static analysis token/)
      expect(title).not.toBeInTheDocument()
    })
  })

  describe('when user has team tier', () => {
    beforeEach(() => {
      setup({ showStaticAnalysis: false, multipleTiers: true })
    })

    it('renders Repository upload token component', async () => {
      render(<Tokens />, { wrapper })

      const title = await screen.findByText(/Repository upload token/)
      expect(title).toBeInTheDocument()
    })

    it('renders graph token component', async () => {
      render(<Tokens />, { wrapper })

      const title = await screen.findByText(/Graphing token/)
      expect(title).toBeInTheDocument()
    })

    it('does not render impact analysis component', () => {
      render(<Tokens />, { wrapper })

      const title = screen.queryByText(/Impact analysis token/)
      expect(title).not.toBeInTheDocument()
    })

    it('does not render static token component', () => {
      render(<Tokens />, { wrapper })

      const title = screen.queryByText(/Static analysis token/)
      expect(title).not.toBeInTheDocument()
    })
  })
})
