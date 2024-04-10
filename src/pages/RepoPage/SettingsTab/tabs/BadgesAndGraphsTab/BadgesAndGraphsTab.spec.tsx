import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { PropsWithChildren } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useBranches } from 'services/branches'

import BadgesAndGraphsTab from './BadgesAndGraphsTab'

jest.mock('services/branches')
const mockedUseBranches = useBranches as jest.Mock

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()

const wrapper: React.FC<PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings']}>
    <QueryClientProvider client={queryClient}>
      <Route path="/:provider/:owner/:repo/settings">{children}</Route>
    </QueryClientProvider>
  </MemoryRouter>
)

beforeAll(() => {
  jest.clearAllMocks()
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
      graphql.query('GetRepoSettings', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                graphToken: graphToken,
              },
            },
          })
        )
      })
    )
    mockedUseBranches.mockReturnValue({
      data: {
        branches: [],
      },
      isFetching: false,
      hasNextPage: false,
      fetchNextPage: () => {},
    })
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
