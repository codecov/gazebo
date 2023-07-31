import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useImage } from 'services/image'
import { useLocationParams } from 'services/navigation'
import { useFlags } from 'shared/featureFlags'

import BaseLayout from './BaseLayout'

jest.mock('services/navigation/useLocationParams')
jest.mock('services/image')
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const server = setupServer()

const wrapper =
  (initialEntries = ['/bb/batman/batcave']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo">{children}</Route>
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
afterAll(() => server.close())

describe('BaseLayout', () => {
  afterEach(() => jest.resetAllMocks())
  function setup(
    {
      termsOfServicePage = false,
      currentUser = loggedInUser,
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

    useLocationParams.mockReturnValue({
      params: { setup_action: 'install' },
    })

    server.use(
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

  describe('feature flag is on and set up action param is install', () => {
    it('renders the select org page with banner', async () => {
      setup({ defaultOrgSelectorPage: true, currentUser: userHasDefaultOrg })

      render(<BaseLayout>hello</BaseLayout>, {
        wrapper: wrapper(['/bb/batman/batcave?setup_action=install']),
      })

      expect(await screen.findByText(/DefaultOrgSelector/)).toBeTruthy()
      const selectInput = screen.getByText(/DefaultOrgSelector/)
      expect(selectInput).toBeInTheDocument()
    })
  })

  describe('user is not on full access experience', () => {
    it('renders the select org page with banner', async () => {
      setup({ termsOfServicePage: true, currentUser: loggedInUser })

      render(<BaseLayout>hello</BaseLayout>, {
        wrapper: wrapper(['/bb/batman/batcave?setup_action=install']),
      })

      expect(await screen.findByText(/InstallationHelpBanner/)).toBeTruthy()
      const selectInput = screen.getByText(/InstallationHelpBanner/)
      expect(selectInput).toBeInTheDocument()
    })
  })
})
