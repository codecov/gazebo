import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import Tokens from './Tokens'

vi.mock('config')

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
  function setup({ isSelfHosted = false } = {}) {
    config.IS_SELF_HOSTED = isSelfHosted

    server.use(
      graphql.query('GetRepoSettings', () => {
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

    it('renders static token component', async () => {
      setup()
      render(<Tokens />, { wrapper })

      const title = await screen.findByText(/Static analysis token/)
      expect(title).toBeInTheDocument()
    })
  })

  describe('when self hosted', () => {
    it('does not render static token component', async () => {
      setup({ isSelfHosted: true })
      render(<Tokens />, { wrapper })

      const uploadToken = await screen.findByText(/Repository upload token/)
      expect(uploadToken).toBeInTheDocument()

      const title = screen.queryByText(/Static analysis token/)
      expect(title).not.toBeInTheDocument()
    })
  })
})
