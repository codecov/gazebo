import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import {
  InternalUserData,
  InternalUserOwnerData,
} from 'services/user/useInternalUser'

import SyncProviderPage from './SyncProviderPage'

const createMockedInternalUser = (
  owner?: InternalUserOwnerData
): InternalUserData => ({
  email: null,
  name: null,
  externalId: null,
  owners: [owner],
})

const queryClient = new QueryClient()
const server = setupServer()

let testLocation: { pathname: string } = {
  pathname: '',
}

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/sync']}>
      <Route path="/sync">{children}</Route>
      <Route
        path="*"
        render={({ location }) => {
          testLocation.pathname = location.pathname
          return null
        }}
      />
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  user?: InternalUserData
}

describe('SyncProviderPage', () => {
  function setup({ user = createMockedInternalUser() }: SetupArgs) {
    server.use(
      rest.get('/internal/user', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(user))
      )
    )
  }

  describe('user has not synced a provider', () => {
    it('renders page header', async () => {
      setup({
        user: createMockedInternalUser({ name: 'test-provider' }),
      })

      render(<SyncProviderPage />, { wrapper })

      const header = screen.getByRole('heading', {
        name: /What repo provider would you like to sync?/,
      })
      expect(header).toBeInTheDocument()
    })

    it('renders paragraph text', async () => {
      setup({
        user: createMockedInternalUser({ name: 'test-provider' }),
      })

      render(<SyncProviderPage />, { wrapper })

      const paragraph = await screen.findByText(
        /You'll be taken to your repo provider to authenticate/
      )
      expect(paragraph).toBeInTheDocument()
    })

    it('renders github sync button', async () => {
      setup({
        user: createMockedInternalUser({ name: 'test-provider' }),
      })

      render(<SyncProviderPage />, { wrapper })

      const githubSyncButton = await screen.findByText(/Sync with Github/)
      expect(githubSyncButton).toBeInTheDocument()
    })

    it('renders gitlab sync button', async () => {
      setup({
        user: createMockedInternalUser({ name: 'test-provider' }),
      })

      render(<SyncProviderPage />, { wrapper })

      const gitlabSyncButton = await screen.findByText(/Sync with Gitlab/)
      expect(gitlabSyncButton).toBeInTheDocument()
    })

    it('renders bitbucket sync button', async () => {
      setup({
        user: createMockedInternalUser({ name: 'test-provider' }),
      })

      render(<SyncProviderPage />, { wrapper })

      const bitbucketSyncButton = await screen.findByText(/Sync with BitBucket/)
      expect(bitbucketSyncButton).toBeInTheDocument()
    })
  })

  describe('user has synced a provider', () => {
    describe('service is valid', () => {
      it('redirects to the service provider', async () => {
        setup({
          user: createMockedInternalUser({
            name: 'github',
            service: 'github',
          }),
        })

        render(<SyncProviderPage />, { wrapper })

        await waitFor(() => expect(testLocation.pathname).toBe('/gh'))
      })
    })
    describe('user does not have a service', () => {
      it('redirects user to /', async () => {
        setup({
          user: createMockedInternalUser({ name: 'github' }),
        })

        render(<SyncProviderPage />, { wrapper })

        await waitFor(() => expect(testLocation.pathname).toBe('/'))
      })
    })
  })
})
