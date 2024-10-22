import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'
import { type Mock } from 'vitest'

import config from 'config'

import { useImage } from 'services/image'
import { useImpersonate } from 'services/impersonate'
import { useInternalUser, useUser } from 'services/user'

import BaseLayout from './BaseLayout'

vi.mock('services/image')
const mockedUseImage = useImage as Mock

vi.mock('services/impersonate')
const mockedUseImpersonate = useImpersonate as Mock

vi.mock('shared/GlobalTopBanners', () => ({
  default: () => 'GlobalTopBanners',
}))
vi.mock('./InstallationHelpBanner', () => ({
  default: () => 'InstallationHelpBanner',
}))
vi.mock('pages/TermsOfService', () => ({ default: () => 'TermsOfService' }))
vi.mock('pages/DefaultOrgSelector', () => ({
  default: () => 'DefaultOrgSelector',
}))
vi.mock('layouts/Header', () => ({ default: () => 'Header' }))
vi.mock('layouts/Footer', () => ({ default: () => 'Footer' }))

const mockOwner = {
  owner: {
    me: {},
    isCurrentUserPartOfOrg: true,
  },
}

const mockUser = {
  name: 'codecov',
  email: 'codecovuser@codecov.io',
  username: 'CodecovUser',
  avatarUrl: 'http://photo.com/codecov.png',
  avatar: 'http://photo.com/codecov.png',
  student: false,
  studentCreatedAt: null,
  studentUpdatedAt: null,
  customerIntent: 'BUSINESS',
  externalId: 'asdf',
  owners: [
    {
      avatarUrl: 'http://127.0.0.1/cool-user',
      integrationId: null,
      name: null,
      ownerid: 123,
      stats: null,
      username: 'cool-username',
      service: 'github',
    },
  ],
  termsAgreement: true,
}

const mockUserNoTermsAgreement = {
  ...mockUser,
  termsAgreement: false,
}

const mockTrackingMetadata = {
  service: 'github',
  ownerid: 123,
  serviceId: '123',
  plan: 'users-basic',
  staff: false,
  hasYaml: false,
  bot: null,
  delinquent: null,
  didTrial: null,
  planProvider: null,
  planUserCount: 1,
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  profile: {
    createdAt: 'timestamp',
    otherGoal: null,
    typeProjects: [],
    goals: [],
  },
}

const mockMe = {
  owner: {
    defaultOrgUsername: null,
  },
  email: 'jane.doe@codecov.io',
  privateAccess: true,
  onboardingCompleted: true,
  businessEmail: 'jane.doe@codecov.io',
  termsAgreement: true,
  user: mockUser,
  trackingMetadata: mockTrackingMetadata,
}

const userNoTermsAgreement = {
  me: {
    ...mockMe,
    user: mockUserNoTermsAgreement,
    termsAgreement: false,
  },
}

const userHasDefaultOrg = {
  me: {
    ...mockMe,
    owner: {
      defaultOrgUsername: 'codecov',
    },
  },
}

const loggedInUser = {
  me: mockMe,
}

const guestUser = {
  me: null,
}

const internalUserNoSyncedProviders = {
  email: mockUser.email,
  name: mockUser.name,
  externalId: '123',
  termsAgreement: true,
  owners: [],
}

const internalUserHasSyncedProviders = {
  email: mockUser.email,
  name: mockUser.name,
  externalId: '123',
  owners: [
    {
      avatarUrl: 'http://127.0.0.1/cool-user',
      integrationId: null,
      name: null,
      ownerid: 123,
      stats: null,
      username: 'cool-username',
      service: 'github',
    },
  ],
  termsAgreement: true,
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: false,
    },
  },
})
const server = setupServer()

let testLocation: ReturnType<typeof useLocation>
const wrapper: (
  initialEntries?: string[]
) => React.FC<React.PropsWithChildren> =
  (initialEntries = ['/bb/batman/batcave']) =>
  ({ children }) => (
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
  vi.clearAllMocks()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  currentUser?: {
    me: ReturnType<typeof useUser>['data'] | null
  }
  internalUser?: ReturnType<typeof useInternalUser>['data']
  isImpersonating?: boolean
}

describe('BaseLayout', () => {
  function setup({
    currentUser = loggedInUser,
    internalUser = internalUserHasSyncedProviders,
    isImpersonating = false,
  }: SetupArgs) {
    mockedUseImage.mockReturnValue({
      src: 'http://photo.com/codecov.png',
      isLoading: false,
      error: null,
    })
    mockedUseImpersonate.mockReturnValue({ isImpersonating })

    server.use(
      http.get('/internal/user', (info) => {
        return HttpResponse.json(internalUser)
      }),
      graphql.query('CurrentUser', (info) => {
        return HttpResponse.json({ data: currentUser })
      }),
      graphql.query('DetailOwner', (info) => {
        return HttpResponse.json({ data: mockOwner })
      }),
      http.get('/internal/:provider/:owner/account-details', (info) => {
        return HttpResponse.json({})
      }),
      // Self hosted only
      graphql.query('HasAdmins', (info) => {
        return HttpResponse.json({ data: {} })
      }),
      graphql.query('Seats', (info) => {
        return HttpResponse.json({ data: {} })
      }),
      graphql.query('TermsOfService', (info) => {
        return HttpResponse.json({ data: {} })
      }),
      graphql.query('UseMyOrganizations', (info) => {
        return HttpResponse.json({
          data: {
            myOrganizationsData: {
              me: {
                myOrganizations: {
                  edges: [],
                  pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
                },
              },
            },
          },
        })
      }),
      graphql.mutation('updateDefaultOrganization', (info) => {
        return HttpResponse.json({ data: {} })
      }),
      http.get('/internal/users/current', (info) => {
        return HttpResponse.json({})
      })
    )
  }

  describe('cloud', () => {
    describe('when user is a guest', () => {
      it('renders the children', async () => {
        setup({ currentUser: guestUser, internalUser: null })
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

    describe('when user is impersonating', () => {
      it('renders the children', async () => {
        setup({
          isImpersonating: true,
          internalUser: mockUser,
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

    describe('when TOS is not signed', () => {
      it('renders terms of service component', async () => {
        setup({
          currentUser: userNoTermsAgreement,
          internalUser: mockUserNoTermsAgreement,
        })
        render(<BaseLayout>hello</BaseLayout>, { wrapper: wrapper() })

        const termsOfService = await screen.findByText(/TermsOfService/)
        expect(termsOfService).toBeInTheDocument()
      })

      it('does not render the header', async () => {
        setup({
          currentUser: userNoTermsAgreement,
          internalUser: mockUserNoTermsAgreement,
        })
        render(<BaseLayout>hello</BaseLayout>, { wrapper: wrapper() })

        const termsOfService = await screen.findByText(/TermsOfService/)
        expect(termsOfService).toBeInTheDocument()

        const header = screen.queryByText(/Header/)
        expect(header).not.toBeInTheDocument()
      })

      it('renders help banner', async () => {
        setup({
          currentUser: userNoTermsAgreement,
          internalUser: mockUserNoTermsAgreement,
        })

        render(<BaseLayout>hello</BaseLayout>, { wrapper: wrapper() })
        const helpBanner = await screen.findByText(/InstallationHelpBanner/)
        expect(helpBanner).toBeInTheDocument()
      })
    })

    describe('when no default org selected', () => {
      it('renders the default org selector', async () => {
        setup({
          currentUser: loggedInUser,
          internalUser: mockUser,
        })
        render(<BaseLayout>hello</BaseLayout>, { wrapper: wrapper() })

        const defaultOrgSelector = await screen.findByText(/DefaultOrgSelector/)
        expect(defaultOrgSelector).toBeInTheDocument()
      })

      it('does not render the header', async () => {
        setup({
          currentUser: loggedInUser,
          internalUser: mockUser,
        })
        render(<BaseLayout>hello</BaseLayout>, { wrapper: wrapper() })

        const defaultOrgSelector = await screen.findByText(/DefaultOrgSelector/)
        expect(defaultOrgSelector).toBeInTheDocument()

        const header = screen.queryByText(/Header/)
        expect(header).not.toBeInTheDocument()
      })

      it('renders help banner', async () => {
        setup({
          currentUser: loggedInUser,
          internalUser: mockUser,
        })

        render(<BaseLayout>hello</BaseLayout>, { wrapper: wrapper() })
        const helpBanner = await screen.findByText(/InstallationHelpBanner/)
        expect(helpBanner).toBeInTheDocument()
      })
    })

    describe('when agreed to TOS and default org selected', () => {
      it('renders children', async () => {
        setup({ currentUser: userHasDefaultOrg })
        render(<BaseLayout>hello</BaseLayout>, { wrapper: wrapper() })

        const children = await screen.findByText(/hello/)
        expect(children).toBeInTheDocument()
      })

      it('renders header', async () => {
        setup({ currentUser: userHasDefaultOrg })
        render(<BaseLayout>hello</BaseLayout>, { wrapper: wrapper() })

        const header = await screen.findByText(/Header/)
        expect(header).toBeInTheDocument()
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
  })

  describe('self hosted', () => {
    beforeAll(() => {
      config.IS_SELF_HOSTED = true
    })
    afterAll(() => {
      config.IS_SELF_HOSTED = undefined
    })

    describe('when user is a guest', () => {
      it('renders the children', async () => {
        setup({ currentUser: guestUser, internalUser: null })
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

    describe('when user is impersonating', () => {
      it('renders the children', async () => {
        setup({
          isImpersonating: true,
          internalUser: mockUser,
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

    describe('when TOS is not signed', () => {
      it('does not render terms of service component', async () => {
        setup({
          currentUser: userNoTermsAgreement,
          internalUser: mockUserNoTermsAgreement,
        })
        render(<BaseLayout>hello</BaseLayout>, { wrapper: wrapper() })

        const children = await screen.findByText(/hello/)
        expect(children).toBeInTheDocument()

        const header = await screen.findByText(/Header/)
        expect(header).toBeInTheDocument()

        const termsOfService = screen.queryByText(/TermsOfService/)
        expect(termsOfService).not.toBeInTheDocument()
      })
    })

    describe('when no default org selected', () => {
      it('does not render the default org selector', async () => {
        setup({
          currentUser: loggedInUser,
          internalUser: mockUser,
        })
        render(<BaseLayout>hello</BaseLayout>, { wrapper: wrapper() })

        const children = await screen.findByText(/hello/)
        expect(children).toBeInTheDocument()

        const header = await screen.findByText(/Header/)
        expect(header).toBeInTheDocument()

        const defaultOrgSelector = screen.queryByText(/DefaultOrgSelector/)
        expect(defaultOrgSelector).not.toBeInTheDocument()
      })
    })

    describe('when agreed to TOS and default org selected', () => {
      it('renders children', async () => {
        setup({ currentUser: userHasDefaultOrg })
        render(<BaseLayout>hello</BaseLayout>, { wrapper: wrapper() })

        const children = await screen.findByText(/hello/)
        expect(children).toBeInTheDocument()
      })

      it('renders header', async () => {
        setup({ currentUser: userHasDefaultOrg })
        render(<BaseLayout>hello</BaseLayout>, { wrapper: wrapper() })

        const header = await screen.findByText(/Header/)
        expect(header).toBeInTheDocument()
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
  })

  describe('When main app has error', () => {
    it('still renders the header and footer content independently', async () => {
      const ErrorThrowingComponent = () => {
        throw new Error('Test Error')
      }

      setup({ currentUser: userHasDefaultOrg })
      render(
        <BaseLayout>
          <ErrorThrowingComponent />
        </BaseLayout>,

        { wrapper: wrapper() }
      )

      const globalTopBanners = await screen.findByText(/GlobalTopBanners/)
      expect(globalTopBanners).toBeInTheDocument()
      const header = await screen.findByText(/Header/)
      expect(header).toBeInTheDocument()
      const footer = await screen.findByText(/Footer/)
      expect(footer).toBeInTheDocument()
    })
  })
})
