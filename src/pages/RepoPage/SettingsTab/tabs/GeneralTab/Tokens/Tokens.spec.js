import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Tokens from './Tokens'

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

      const title = await screen.findByText(/Repository graphing token/)
      expect(title).toBeInTheDocument()
    })
  })
})
