import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
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
  termsAgreement: false,
  owners: owner !== undefined ? [owner] : [],
})

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const testLocation: { pathname: string } = {
  pathname: '',
}

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/sync']}>
        <Route path="/sync">
          <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
        </Route>
        <Route
          path="*"
          render={({ location }) => {
            testLocation.pathname = location.pathname
            return null
          }}
        />
      </MemoryRouter>
    </QueryClientProvider>
  </QueryClientProviderV5>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  user?: Partial<InternalUserData>
  noSyncProviders?: boolean
}

describe('SyncProviderPage', () => {
  function setup(
    {
      user = createMockedInternalUser(),
      noSyncProviders = false,
    }: SetupArgs = {
      user: createMockedInternalUser(),
      noSyncProviders: false,
    }
  ) {
    server.use(
      http.get('/internal/user', () => {
        return HttpResponse.json(user)
      }),
      graphql.query('GetSyncProviders', () => {
        if (noSyncProviders) {
          return HttpResponse.json({
            data: {
              config: { syncProviders: [] },
            },
          })
        }

        return HttpResponse.json({
          data: {
            config: { syncProviders: ['GITHUB', 'GITLAB_ENTERPRISE'] },
          },
        })
      })
    )
  }

  describe('user has not synced a provider', () => {
    it('renders page header', async () => {
      setup({
        user: createMockedInternalUser(),
      })
      render(<SyncProviderPage />, { wrapper })

      const header = await screen.findByRole('heading', {
        name: /What repo provider would you like to sync?/,
      })
      expect(header).toBeInTheDocument()
    })

    it('renders paragraph text', async () => {
      setup()
      render(<SyncProviderPage />, { wrapper })

      const paragraph = await screen.findByText(
        /You'll be taken to your repo provider to authenticate/
      )
      expect(paragraph).toBeInTheDocument()
    })

    describe('there are configured sync providers', () => {
      it('renders github sync button', async () => {
        setup()
        render(<SyncProviderPage />, { wrapper })

        const githubSyncButton = await screen.findByText(/Sync with Github/)
        expect(githubSyncButton).toBeInTheDocument()
      })

      it('renders github enterprise sync button', async () => {
        setup()

        render(<SyncProviderPage />, { wrapper })

        const gheSyncButton = await screen.findByText(
          /Sync with Gitlab Enterprise/
        )
        expect(gheSyncButton).toBeInTheDocument()
      })
    })

    describe('there are no configured sync providers', () => {
      it('renders error message', async () => {
        setup({ noSyncProviders: true })
        render(<SyncProviderPage />, { wrapper })

        const errorMsg = await screen.findByText(
          /Unable to retrieve list of Git providers/
        )
        expect(errorMsg).toBeInTheDocument()
      })

      it('renders link to self hosted install guide', async () => {
        setup({ noSyncProviders: true })
        render(<SyncProviderPage />, { wrapper })

        const docLink = await screen.findByRole('link', {
          name: /Codecov Self-Hosted Install Guide/,
        })
        expect(docLink).toBeInTheDocument()
        expect(docLink).toHaveAttribute(
          'href',
          'https://docs.codecov.com/docs/installing-codecov-self-hosted'
        )
      })
    })
  })

  describe('user has synced a provider', () => {
    describe('service is valid', () => {
      it('redirects to the service provider', async () => {
        setup({
          user: createMockedInternalUser({
            name: 'github',
            service: 'github',
            username: 'codecov-user',
            avatarUrl: 'http://127.0.0.1/cool-user-avatar',
            integrationId: null,
            ownerid: 123,
            stats: null,
          }),
        })

        render(<SyncProviderPage />, { wrapper })

        await waitFor(() => expect(testLocation.pathname).toBe('/gh'))
      })
    })

    describe('user does not have a service', () => {
      it('redirects user to /', async () => {
        setup({ user: createMockedInternalUser(null) })

        render(<SyncProviderPage />, { wrapper })

        await waitFor(() => expect(testLocation.pathname).toBe('/'))
      })
    })
  })
})
