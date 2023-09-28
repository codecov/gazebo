import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useImage } from 'services/image'
import { useImpersonate } from 'services/impersonate'
import { useFlags } from 'shared/featureFlags'

import BaseLayout from './BaseLayout'

jest.mock('services/image')
jest.mock('services/impersonate')
jest.mock('shared/featureFlags')
jest.mock('shared/GlobalTopBanners', () => () => 'GlobalTopBanners')
jest.mock('./InstallationHelpBanner', () => () => 'InstallationHelpBanner')
jest.mock('pages/TermsOfService', () => () => 'TermsOfService')
jest.mock('pages/DefaultOrgSelector', () => () => 'DefaultOrgSelector')

const mockOwner = {
  owner: {
    me: {},
    isCurrentUserPartOfOrg: true,
  },
}

const userSignedInIdentity = {
  username: 'CodecovUser',
  email: 'codecov@codecov.io',
  name: 'codecov',
  avatarUrl: 'http://photo.com/codecov.png',
}

const userHasDefaultOrg = {
  me: {
    owner: {
      defaultOrgUsername: 'codecov',
    },
    user: {
      ...userSignedInIdentity,
    },
    trackingMetadata: { ownerid: 123 },
    ...userSignedInIdentity,
  },
}

const loggedInUser = {
  me: {
    termsAgreement: false,
    user: {
      ...userSignedInIdentity,
    },
    trackingMetadata: { ownerid: 123 },
    ...userSignedInIdentity,
  },
}

const guestUser = {
  me: null,
}

const internalUserNoSyncedProviders = {
  email: userSignedInIdentity.email,
  name: userSignedInIdentity.name,
  externalId: '123',
  owners: [],
}

const internalUserHasSyncedProviders = {
  email: userSignedInIdentity.email,
  name: userSignedInIdentity.name,
  externalId: '123',
  owners: [
    {
      service: 'github',
    },
  ],
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const server = setupServer()

let testLocation
const wrapper =
  (initialEntries = ['/bb/batman/batcave']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo">{children}</Route>
          <Route
            path="*"
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('BaseLayout', () => {
  afterEach(() => jest.resetAllMocks())
  function setup(
    {
      currentUser = loggedInUser,
      internalUser = internalUserHasSyncedProviders,
      isImpersonating = false,
      termsOfServicePage = false,
      defaultOrgSelectorPage = false,
    } = {
      termsOfServicePage: false,
      currentUser: loggedInUser,
      defaultOrgSelectorPage: false,
    }
  ) {
    useImage.mockReturnValue({
      src: 'http://photo.com/codecov.png',
      isLoading: false,
      error: null,
    })
    useFlags.mockReturnValue({
      termsOfServicePage,
      defaultOrgSelectorPage,
    })
    useImpersonate.mockReturnValue({ isImpersonating })

    server.use(
      rest.get('/internal/user', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(internalUser))
      }),
      graphql.query('CurrentUser', (_, res, ctx) =>
        res(ctx.status(200), ctx.data(currentUser))
      ),
      graphql.query('DetailOwner', (_, res, ctx) =>
        res(ctx.status(200), ctx.data(mockOwner))
      ),
      rest.get('/internal/:provider/:owner/account-details', (_, res, ctx) =>
        res(ctx.status(200), ctx.json({}))
      ),
      // Self hosted only
      graphql.query('HasAdmins', (_, res, ctx) =>
        res(ctx.status(200), ctx.data({}))
      ),
      graphql.query('Seats', (_, res, ctx) =>
        res(ctx.status(200), ctx.data({}))
      ),
      graphql.query('TermsOfService', (_, res, ctx) =>
        res(ctx.status(200), ctx.data({}))
      ),
      graphql.query('UseMyOrganizations', (_, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            myOrganizationsData: {
              me: {
                myOrganizations: {
                  edges: [],
                  pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
                },
              },
            },
          })
        )
      ),
      rest.get('/internal/users/current', (_, res, ctx) =>
        res(ctx.status(200), ctx.json({}))
      )
    )
  }

  describe.each([
    ['cloud', false, 'terms of services', /TermsOfService/],
    ['self hosted', true, 'children', /hello/],
  ])('%s', (_, isSelfHosted, expectedPage, expectedMatcher) => {
    beforeEach(() => {
      config.IS_SELF_HOSTED = isSelfHosted
      jest.resetAllMocks()
    })
    afterAll(() => (config.IS_SELF_HOSTED = undefined))

    describe('user is guest', () => {
      beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {})
        setup({ currentUser: guestUser })
      })

      it('renders the children', async () => {
        render(<BaseLayout>hello</BaseLayout>, {
          wrapper: wrapper(),
        })

        expect(await screen.findByText('hello')).toBeTruthy()
        const hello = screen.getByText('hello')
        expect(hello).toBeInTheDocument()

        const defaultOrg = screen.queryByText(/DefaultOrgSelector/)
        expect(defaultOrg).not.toBeInTheDocument()

        const termsOfService = screen.queryByText(/TermsOfService/)
        expect(termsOfService).not.toBeInTheDocument()
      })
    })

    describe('user is impersonating', () => {
      it('renders the children', async () => {
        setup({
          isImpersonating: true,
        })
        render(<BaseLayout>hello</BaseLayout>, {
          wrapper: wrapper(),
        })

        expect(await screen.findByText('hello')).toBeTruthy()
        const hello = screen.getByText('hello')
        expect(hello).toBeInTheDocument()

        const defaultOrg = screen.queryByText(/DefaultOrgSelector/)
        expect(defaultOrg).not.toBeInTheDocument()

        const termsOfService = screen.queryByText(/TermsOfService/)
        expect(termsOfService).not.toBeInTheDocument()
      })
    })

    describe('TOS feature flag is off, org selector flag is off', () => {
      it('does not render children', async () => {
        setup({
          currentUser: loggedInUser,
        })

        render(<BaseLayout>hello</BaseLayout>, {
          wrapper: wrapper(),
        })

        expect(await screen.findByText('hello')).toBeTruthy()
        const hello = screen.getByText('hello')
        expect(hello).toBeInTheDocument()

        const defaultOrg = screen.queryByText(/DefaultOrgSelector/)
        expect(defaultOrg).not.toBeInTheDocument()

        const termsOfService = screen.queryByText(/TermsOfService/)
        expect(termsOfService).not.toBeInTheDocument()
      })
    })

    it(`renders the ${expectedPage}`, async () => {
      setup({ termsOfServicePage: true, currentUser: loggedInUser })

      render(<BaseLayout>hello</BaseLayout>, {
        wrapper: wrapper(),
      })

      expect(await screen.findByText(expectedMatcher)).toBeTruthy()
      const tos = screen.getByText(expectedMatcher)
      expect(tos).toBeInTheDocument()
    })
  })

  describe('selector flag is on and set up action param is install', () => {
    it('renders the select org page with banner', async () => {
      setup({ defaultOrgSelectorPage: true, currentUser: loggedInUser })

      render(<BaseLayout>hello</BaseLayout>, {
        wrapper: wrapper(['/bb/batman/batcave?setup_action=install']),
      })

      expect(await screen.findByText(/DefaultOrgSelector/)).toBeTruthy()
      const selectInput = screen.getByText(/DefaultOrgSelector/)
      expect(selectInput).toBeInTheDocument()
    })

    it('does not render the select org page for users that have default org', async () => {
      setup({
        defaultOrgSelectorPage: true,
        currentUser: userHasDefaultOrg,
      })

      render(<BaseLayout>hello</BaseLayout>, {
        wrapper: wrapper(['/bb/batman/batcave?setup_action=request']),
      })

      const selectInput = screen.queryByText(/DefaultOrgSelector/)
      expect(selectInput).not.toBeInTheDocument()
    })
  })

  describe('user has not synced with providers', () => {
    it('redirects the user to /sync', async () => {
      setup({
        internalUser: internalUserNoSyncedProviders,
      })

      render(<BaseLayout>hello</BaseLayout>, {
        wrapper: wrapper(),
      })

      await waitFor(() => expect(testLocation.pathname).toBe('/sync'))
    })
  })

  describe('user has synced providers', () => {
    it('renders the page', async () => {
      setup({
        internalUser: internalUserHasSyncedProviders,
      })

      render(<BaseLayout>hello</BaseLayout>, {
        wrapper: wrapper(),
      })

      const text = await screen.findByText('hello')
      expect(text).toBeInTheDocument()
    })
  })

  describe('user is not on full access experience', () => {
    it('renders the select org page with banner', async () => {
      setup({ defaultOrgSelectorPage: true, currentUser: loggedInUser })

      render(<BaseLayout>hello</BaseLayout>, {
        wrapper: wrapper(['/bb/batman/batcave?setup_action=install']),
      })

      expect(await screen.findByText(/InstallationHelpBanner/)).toBeTruthy()
      const selectInput = screen.getByText(/InstallationHelpBanner/)
      expect(selectInput).toBeInTheDocument()
    })
  })
})
