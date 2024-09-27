import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import BadgesAndGraphsTab from './BadgesAndGraphsTab'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/codecov-client/config']}>
    <QueryClientProvider client={queryClient}>
      <Route path="/:provider/:owner/:repo/config">{children}</Route>
    </QueryClientProvider>
  </MemoryRouter>
)

beforeAll(() => {
  vi.clearAllMocks()
  server.listen()
  console.error = () => {}
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('BadgesAndGraphsTab', () => {
  function setup({ graphToken }: { graphToken: string | null }) {
    server.use(
      graphql.query('GetBranches', (info) => {
        return HttpResponse.json({
          data: {
            owner: {
              repository: {
                branches: {
                  edges: [],
                },
              },
            },
          },
        })
      }),
      graphql.query('GetRepoSettings', (info) => {
        return HttpResponse.json({
          data: {
            owner: {
              repository: {
                __typename: 'Repository',
                activated: true,
                defaultBranch: 'master',
                private: true,
                uploadToken: 'token',
                graphToken,
                yaml: 'yaml',
                bot: {
                  username: 'test',
                },
                profilingToken: null,
                staticAnalysisToken: null,
              },
            },
          },
        })
      })
    )
  }

  describe('when rendered with graphToken', () => {
    it('renders badges component', async () => {
      setup({ graphToken: 'WIO9JXFGE3' })
      render(<BadgesAndGraphsTab />, { wrapper })

      const title = await screen.findByText(/Codecov badge/)
      expect(title).toBeInTheDocument()
    })

    it('renders graphs component', async () => {
      setup({ graphToken: 'WIO9JXFGE3' })
      render(<BadgesAndGraphsTab />, { wrapper })

      const title = await screen.findByText(/Graphs/)
      expect(title).toBeInTheDocument()
    })
  })

  describe('when rendered with no graphToken', () => {
    it('does not render badges component', () => {
      setup({ graphToken: null })
      render(<BadgesAndGraphsTab />, { wrapper })

      const title = screen.queryByText(/Codecov badge/)
      expect(title).not.toBeInTheDocument()
    })

    it('does not render graphs component', () => {
      setup({ graphToken: null })
      render(<BadgesAndGraphsTab />, { wrapper })

      const title = screen.queryByText(/Graphs/)
      expect(title).not.toBeInTheDocument()
    })
  })
})
