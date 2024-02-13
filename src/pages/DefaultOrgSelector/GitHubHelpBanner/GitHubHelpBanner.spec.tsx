import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import GitHubHelpBanner from './GitHubHelpBanner'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()

beforeAll(() => {
  server.listen()
})
beforeEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

const wrapper =
  ({ provider = 'gh' } = {}): React.FC<React.PropsWithChildren> =>
  ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/${provider}/codecov/analytics/new`]}>
          <Switch>
            <Route path="/:provider/:owner/:repo/new">{children}</Route>
          </Switch>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

describe('GitHubHelpBanner', () => {
  function setup() {
    const mutation = jest.fn()

    server.use(
      graphql.query('IsSyncing', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            me: {
              isSyncing: false,
            },
          })
        )
      }),
      graphql.mutation('SyncData', (req, res, ctx) => {
        mutation(req.variables)

        return res(
          ctx.status(200),
          ctx.data({
            syncWithGitProvider: {
              me: {
                isSyncing: true,
              },
            },
          })
        )
      })
    )

    return { user: userEvent.setup(), mutation }
  }
  describe('when rendered with github provider', () => {
    it('renders banner title', () => {
      render(<GitHubHelpBanner />, { wrapper: wrapper({ provider: 'gh' }) })

      const title = screen.getByText(/Don't see your org?/)
      expect(title).toBeInTheDocument()
    })

    it('renders banner body', () => {
      render(<GitHubHelpBanner />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      const body = screen.getByText(/need the organization admin/)
      expect(body).toBeInTheDocument()
    })

    it('renders banner body with correct links', () => {
      render(<GitHubHelpBanner />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      const link = screen.getByRole('link', {
        name: /GitHub App is required/,
      })
      expect(link).toHaveAttribute('href', 'https://github.com/apps/codecov')
    })
  })

  describe('when rendered with other providers', () => {
    it('does not render banner title', () => {
      render(<GitHubHelpBanner />, { wrapper: wrapper({ provider: 'gl' }) })

      const title = screen.queryByText(/Don't see your org?/)
      expect(title).not.toBeInTheDocument()
    })

    it('does not render banner body', () => {
      render(<GitHubHelpBanner />, {
        wrapper: wrapper({ provider: 'gl' }),
      })

      const body = screen.queryByText(/need the organization admin/)
      expect(body).not.toBeInTheDocument()
    })
  })

  describe('when user clicks on re-sync', () => {
    it('renders syncing status', async () => {
      const { user, mutation } = setup()

      render(<GitHubHelpBanner />, {
        wrapper: wrapper(),
      })

      const reSync = screen.getByText(/Re-sync/)
      expect(reSync).toBeInTheDocument()

      await user.click(reSync)

      await waitFor(() => expect(mutation).toHaveBeenCalledTimes(1))

      const syncing = await screen.findByText(/Syncing your organizations.../)
      expect(syncing).toBeInTheDocument()
    })
  })
})
