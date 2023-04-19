import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import Tokens from './Tokens'

jest.mock('shared/featureFlags')

const queryClient = new QueryClient()
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
  function setup({ showStaticAnalysis = true } = { showStaticAnalysis: true }) {
    useFlags.mockReturnValue({
      staticAnalysisToken: showStaticAnalysis,
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
})
