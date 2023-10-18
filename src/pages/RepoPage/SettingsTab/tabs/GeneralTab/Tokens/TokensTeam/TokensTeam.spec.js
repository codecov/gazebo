import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Tokens from './TokensTeam'

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

describe('TokensTeam', () => {
  function setup() {
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
      })
    )
  }

  describe('when rendered', () => {
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
