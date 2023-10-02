import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import RepoOrgNotFound from './RepoOrgNotFound'

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

const wrapper = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/gh/codecov']}>
        <Switch>
          <Route path="/:provider">{children}</Route>
        </Switch>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('RepoOrgNotFound', () => {
  function setup() {
    const triggerResync = jest.fn()

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
        triggerResync(req.variables)

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

    return { triggerResync, user: userEvent.setup() }
  }

  describe('when  sync is not in progress', () => {
    it("renders can't find your repo", async () => {
      setup()
      render(<RepoOrgNotFound />, { wrapper })

      const copy = await screen.findByText(/Can't find your repo/i)
      expect(copy).toBeInTheDocument()
    })

    it('renders the button to resync', () => {
      setup()
      render(<RepoOrgNotFound />, { wrapper })

      const resyncButton = screen.getByRole('button', {
        name: /re-sync/i,
      })
      expect(resyncButton).toBeInTheDocument()
    })

    describe('when the user clicks on the button', () => {
      it('calls the triggerResync mutation', async () => {
        const { triggerResync, user } = setup()
        render(<RepoOrgNotFound />, { wrapper })

        const resyncButton = screen.getByRole('button', {
          name: /re-sync/i,
        })
        await user.click(resyncButton)

        expect(triggerResync).toHaveBeenCalledTimes(1)
      })

      it('renders a loading message', async () => {
        const { user } = setup()
        render(<RepoOrgNotFound />, { wrapper })

        const resyncButton = screen.getByRole('button', {
          name: /re-sync/i,
        })
        await user.click(resyncButton)

        const loadingMessage = await screen.findByText(/Syncing\.\.\./i)
        expect(loadingMessage).toBeInTheDocument()
      })
    })
  })
})
