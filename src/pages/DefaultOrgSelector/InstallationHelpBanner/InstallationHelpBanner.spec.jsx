import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'

import InstallationHelpBanner from './InstallationHelpBanner'

jest.mock('services/navigation')

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
  ({ provider = 'gh' } = {}) =>
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

describe('InstallationHelpBanner', () => {
  function setup({ setUpAction } = { setUpAction: 'install' }) {
    const mutation = jest.fn()

    useLocationParams.mockReturnValue({
      params: { setup_action: setUpAction },
    })
    server.use(
      graphql.query('IsSyncing', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            me: {
              isSyncing: true,
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
    it('renders banner body', () => {
      setup()

      render(<InstallationHelpBanner />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      const body = screen.getByText(/Installed organization/)
      expect(body).toBeInTheDocument()

      const body2 = screen.getByText(
        /t may take a few minutes to appear as a selection/
      )
      expect(body2).toBeInTheDocument()
    })
  })

  describe('when rendered with a different setup action', () => {
    it('renders empty dom', () => {
      setup({ setUpAction: 'request' })

      const { container } = render(<InstallationHelpBanner />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when user clicks on re-sync', () => {
    it('renders syncing status', async () => {
      const { user, mutation } = setup()

      render(<InstallationHelpBanner />, {
        wrapper: wrapper(),
      })

      const reSync = screen.getByText(/re-syncing/)
      expect(reSync).toBeInTheDocument()

      user.click(reSync)

      await waitFor(() => expect(mutation).toHaveBeenCalledTimes(1))

      const syncing = await screen.findByText(/syncing/)
      expect(syncing).toBeInTheDocument()
    })
  })

  describe('when rendered with other providers', () => {
    it('does not render banner body', () => {
      setup()

      render(<InstallationHelpBanner />, {
        wrapper: wrapper({ provider: 'gl' }),
      })

      const body = screen.queryByText(/Installed organization/)
      expect(body).not.toBeInTheDocument()
    })
  })
})
