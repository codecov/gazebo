import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Tokens from './Tokens'

const mocks = vi.hoisted(() => ({
  useFlags: vi.fn(),
}))

vi.mock('shared/featureFlags', async () => {
  const actual = await vi.importActual('shared/featureFlags')
  return {
    ...actual,
    useFlags: mocks.useFlags,
  }
})

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
  vi.clearAllMocks()
})
afterAll(() => server.close())

describe('Tokens', () => {
  function setup({ showStaticAnalysis = true } = { showStaticAnalysis: true }) {
    mocks.useFlags.mockReturnValue({
      staticAnalysisToken: showStaticAnalysis,
    })

    server.use(
      graphql.query('GetRepoSettings', (req, res, ctx) => {
        return HttpResponse.json({
          data: {
            owner: {
              repository: {
                __typename: 'Repository',
                activated: true,
                defaultBranch: 'master',
                private: true,
                uploadToken: 'upload token',
                graphToken: 'graph token',
                yaml: 'yaml',
                bot: {
                  username: 'test',
                },
                profilingToken: 'profiling token',
                staticAnalysisToken: 'static analysis token',
              },
            },
          },
        })
      })
    )
  }

  describe('when rendered', () => {
    it('renders Repository upload token component', async () => {
      setup()
      render(<Tokens />, { wrapper })

      const title = await screen.findByText(/Repository upload token/)
      expect(title).toBeInTheDocument()
    })

    it('renders impact analysis component', async () => {
      setup()
      render(<Tokens />, { wrapper })

      const title = await screen.findByText(/Impact analysis token/)
      expect(title).toBeInTheDocument()
    })

    it('renders static token component', async () => {
      setup()
      render(<Tokens />, { wrapper })

      const title = await screen.findByText(/Static analysis token/)
      expect(title).toBeInTheDocument()
    })
  })

  describe('when static analysis flag is disabled', () => {
    it('does not render static token component', () => {
      setup({ showStaticAnalysis: false })
      render(<Tokens />, { wrapper })

      const title = screen.queryByText(/Static analysis token/)
      expect(title).not.toBeInTheDocument()
    })
  })
})
