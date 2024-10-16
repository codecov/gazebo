import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
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

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
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
  function setup({ isGithubRateLimited = false }) {
    const triggerResync = vi.fn()

    server.use(
      graphql.query('IsSyncing', (info) => {
        return HttpResponse.json({
          data: { me: { isSyncing: false } },
        })
      }),

      graphql.query('GetOwnerRateLimitStatus', (info) => {
        return HttpResponse.json({
          data: { me: { owner: { isGithubRateLimited } } },
        })
      }),
      graphql.mutation('SyncData', (info) => {
        triggerResync(info.variables)
        return HttpResponse.json({
          data: { syncWithGitProvider: { me: { isSyncing: true } } },
        })
      })
    )

    return { triggerResync, user: userEvent.setup() }
  }

  describe('when sync is not in progress', () => {
    it("renders can't find your repo", async () => {
      setup({})
      render(<RepoOrgNotFound />, { wrapper })

      const copy = await screen.findByText(/Can't find your repo/i)
      expect(copy).toBeInTheDocument()
    })

    it('renders the button to resync', () => {
      setup({})
      render(<RepoOrgNotFound />, { wrapper })

      const resyncButton = screen.getByRole('button', {
        name: /resync/i,
      })
      expect(resyncButton).toBeInTheDocument()

      const rateLimitText = screen.queryByText(/rate limits/)
      expect(rateLimitText).not.toBeInTheDocument()
    })

    describe('when the user clicks on the button', () => {
      it('calls the triggerResync mutation', async () => {
        const { triggerResync, user } = setup({})
        render(<RepoOrgNotFound />, { wrapper })

        const resyncButton = screen.getByRole('button', {
          name: /resync/i,
        })
        await user.click(resyncButton)

        await waitFor(() => expect(triggerResync).toHaveBeenCalledTimes(1))
      })

      it('renders a loading message', async () => {
        const { user } = setup({})
        render(<RepoOrgNotFound />, { wrapper })

        const resyncButton = screen.getByRole('button', {
          name: /resync/i,
        })
        await user.click(resyncButton)

        const loadingMessage = await screen.findByText(/Syncing\.\.\./i)
        expect(loadingMessage).toBeInTheDocument()
      })
    })

    describe('when the user is rate limited', () => {
      it('shows rate limit messaging', async () => {
        setup({ isGithubRateLimited: true })
        render(<RepoOrgNotFound />, { wrapper })

        const rateLimitText = await screen.findByText(/rate limit/)
        expect(rateLimitText).toBeInTheDocument()
      })
    })
  })
})
