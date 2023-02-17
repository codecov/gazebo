import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import GeneralTab from './GeneralTab'

jest.mock('./DangerZone/RepoState', () => () => 'Repo State')

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

describe('GeneralTab', () => {
  function setup({ uploadToken, defaultBranch, profilingToken, graphToken }) {
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
      })
    )
  }

  describe('when rendered with uploadToken', () => {
    beforeEach(() => {
      setup({ uploadToken: 'random' })
    })

    it('renders Repository upload token component', async () => {
      render(<GeneralTab />, { wrapper })

      const title = await screen.findByText(/Repository upload token/)
      expect(title).toBeInTheDocument()
    })

    it('renders the expected token', async () => {
      render(<GeneralTab />, { wrapper })

      const token = await screen.findByText(/CODECOV_TOKEN=random/)
      expect(token).toBeInTheDocument()
    })
  })

  describe('when rendered with no uploadToken', () => {
    beforeEach(() => {
      setup({ uploadToken: null })
    })

    it('does not render Repository upload token component', () => {
      render(<GeneralTab />, { wrapper })

      const title = screen.queryByText(/Repository upload token/)
      expect(title).not.toBeInTheDocument()
    })
  })

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

  describe('when rendered with profilingToken', () => {
    beforeEach(() => {
      setup({ profilingToken: 'profiling' })
    })

    it('renders impact analysis component', async () => {
      render(<GeneralTab />, { wrapper })

      const title = await screen.findByText(/Impact analysis token/)
      expect(title).toBeInTheDocument()
    })

    it('renders the expected token', async () => {
      render(<GeneralTab />, { wrapper })

      const token = await screen.findByText(/profiling/)
      expect(token).toBeInTheDocument()
    })
  })

  describe('when rendered with no profilingToken', () => {
    beforeEach(() => {
      setup({ profilingToken: null })
    })

    it('does not render  Default Branch component', () => {
      render(<GeneralTab />, { wrapper })

      const title = screen.queryByText(/Impact analysis token/)
      expect(title).not.toBeInTheDocument()
    })
  })

  describe('when rendered with graphToken', () => {
    beforeEach(() => {
      setup({ graphToken: 'random graph token' })
    })

    it('renders graphing token component', async () => {
      render(<GeneralTab />, { wrapper })

      const title = await screen.findByText(/Repository graphing token/)
      expect(title).toBeInTheDocument()
    })

    it('renders the expected token', async () => {
      render(<GeneralTab />, { wrapper })

      const token = await screen.findByText(/random graph token/)
      expect(token).toBeInTheDocument()
    })
  })

  describe('when rendered with no graphToken', () => {
    beforeEach(() => {
      setup({ graphToken: null })
    })

    it('does not render graphing token component', () => {
      render(<GeneralTab />, { wrapper })

      const title = screen.queryByText(/Repository graphing token/)
      expect(title).not.toBeInTheDocument()
    })

    it('renders repo state component', async () => {
      render(<GeneralTab />, { wrapper })

      const title = await screen.findByText(/Repo State/)
      expect(title).toBeInTheDocument()
    })
  })
})
