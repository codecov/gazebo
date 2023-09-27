import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useFlags } from 'shared/featureFlags'

import { useUserAccessGate } from './useUserAccessGate'

jest.mock('shared/featureFlags')
jest.spyOn(console, 'error')

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      retry: false,
      suspense: false,
    },
  },
  logger: {
    error: () => null,
    warn: () => null,
    log: () => null,
  },
})
const server = setupServer()

let testLocation: { pathname: string; search: string } = {
  pathname: '',
  search: '',
}

type WrapperClosure = (
  initialEntries?: string[]
) => React.FC<React.PropsWithChildren>

const wrapper: WrapperClosure =
  (initialEntries = ['/gh']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider">{children}</Route>
          <Route
            path="*"
            render={({ location }) => {
              testLocation.pathname = location.pathname
              testLocation.search = location.search
              return null
            }}
          />
        </MemoryRouter>
      </QueryClientProvider>
    )

interface UserPartial {
  me: {
    user: {
      username: string
      email: string
      name: string
      avatarUrl: string
      termsAgreement?: boolean
    }
    trackingMetadata: {
      ownerid: number
    }
    username: string
    email: string
    name: string
    avatarUrl: string
    termsAgreement?: boolean
  } | null
}

const userSignedInIdentity = {
  username: 'CodecovUser',
  email: 'codecov@codecov.io',
  name: 'codecov',
  avatarUrl: 'photo',
}

const loggedInLegacyUser = {
  me: {
    user: {
      ...userSignedInIdentity,
    },
    trackingMetadata: { ownerid: 123 },
    ...userSignedInIdentity,
  },
}

const userHasDefaultOrg = {
  me: {
    owner: {
      defaultOrgUsername: 'codecov',
    },
    user: {
      ...userSignedInIdentity,
      termsAgreement: true,
    },
    trackingMetadata: { ownerid: 123 },
    ...userSignedInIdentity,
    termsAgreement: true,
  },
}

const loggedInUser = {
  me: {
    owner: {
      defaultOrgUsername: '',
    },
    user: {
      ...userSignedInIdentity,
      termsAgreement: true,
    },
    trackingMetadata: { ownerid: 123 },
    ...userSignedInIdentity,
    termsAgreement: true,
  },
}

const loggedInUnsignedUser = {
  me: {
    user: {
      ...userSignedInIdentity,
      termsAgreement: false,
    },
    trackingMetadata: { ownerid: 123 },
    ...userSignedInIdentity,
    termsAgreement: false,
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

type InternalUser =
  | typeof internalUserNoSyncedProviders
  | typeof internalUserHasSyncedProviders

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

beforeEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

type SetupArgs = {
  user: UserPartial
  internalUser: InternalUser
  termsOfServicePage: boolean
  defaultOrgSelectorPage: boolean
}

describe('useUserAccessGate', () => {
  function setup(
    {
      user = loggedInUser,
      internalUser = internalUserHasSyncedProviders,
      termsOfServicePage = false,
      defaultOrgSelectorPage = false,
    }: SetupArgs = {
      user: loggedInUser,
      internalUser: internalUserHasSyncedProviders,
      termsOfServicePage: false,
      defaultOrgSelectorPage: false,
    }
  ) {
    const mockedUseFlags = jest.mocked(useFlags)
    const mockMutationVariables = jest.fn()

    mockedUseFlags.mockReturnValue({
      termsOfServicePage,
      defaultOrgSelectorPage,
    })

    server.use(
      rest.get('/internal/user', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(internalUser))
      }),

      graphql.query('CurrentUser', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(user))
      }),
      graphql.mutation('updateDefaultOrganization', (req, res, ctx) => {
        mockMutationVariables(req.variables)

        return res(
          ctx.status(200),
          ctx.data({
            updateDefaultOrganization: {
              defaultOrg: {
                username: 'criticalRole',
              },
            },
          })
        )
      })
    )

    return {
      mockMutationVariables,
    }
  }

  afterEach(() => jest.resetAllMocks)

  describe.each([
    [
      'cloud',
      'TOS feature flag: ON',
      'signed TOS',
      {
        user: loggedInUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: true,
        isSelfHosted: false,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'cloud',
      'TOS feature flag: ON',
      'guest',
      {
        user: guestUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: true,
        isSelfHosted: false,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'cloud',
      'TOS feature flag: OFF',
      'signed TOS',
      {
        user: loggedInUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: false,
        isSelfHosted: false,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'cloud',
      'TOS feature flag: OFF',
      'guest',
      {
        user: guestUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: false,
        isSelfHosted: false,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'cloud',
      'TOS feature flag: ON',
      'unsigned TOS',
      {
        user: loggedInUnsignedUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: true,
        isSelfHosted: false,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: false,
            isLoading: false,
            showAgreeToTerms: true,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'cloud',
      'TOS feature flag: OFF',
      'legacy',
      {
        user: loggedInLegacyUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: false,
        isSelfHosted: false,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'cloud',
      'TOS feature flag: OFF',
      'unsigned TOS',
      {
        user: loggedInUnsignedUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: false,
        isSelfHosted: false,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'cloud',
      'org selector feature flag: ON',
      'has default org',
      {
        user: userHasDefaultOrg,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: false,
        isSelfHosted: false,
        defaultOrgSelectorPage: true,
        expected: {
          beforeSettled: {
            isFullExperience: false,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: true,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'cloud',
      'org selector feature flag: ON',
      'does not have a default org',
      {
        user: loggedInUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: false,
        isSelfHosted: false,
        defaultOrgSelectorPage: true,
        expected: {
          beforeSettled: {
            isFullExperience: false,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: true,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: false,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: true,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'TOS feature flag: ON',
      'signed TOS',
      {
        user: loggedInUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: true,
        isSelfHosted: true,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'TOS feature flag: ON',
      'guest',
      {
        user: guestUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: true,
        isSelfHosted: true,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'TOS feature flag: ON',
      'legacy',
      {
        user: loggedInLegacyUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: true,
        isSelfHosted: true,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'TOS feature flag: ON',
      'unsigned TOS',
      {
        user: loggedInUnsignedUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: true,
        isSelfHosted: true,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'TOS feature flag: OFF',
      'signed TOS',
      {
        user: loggedInUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: false,
        isSelfHosted: true,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'TOS feature flag: OFF',
      'guest',
      {
        user: guestUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: false,
        isSelfHosted: true,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'TOS feature flag: OFF',
      'legacy',
      {
        user: loggedInLegacyUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: false,
        isSelfHosted: true,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'TOS feature flag: OFF',
      'unsigned TOS',
      {
        user: loggedInUnsignedUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: false,
        isSelfHosted: true,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'cloud',
      'Sentry login provider',
      'has synced a provider',
      {
        user: loggedInUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: false,
        isSelfHosted: false,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'cloud',
      'Sentry login provider',
      'has not synced a provider',
      {
        user: loggedInUser,
        internalUser: internalUserNoSyncedProviders,
        termsOfServicePage: false,
        isSelfHosted: false,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: false,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: true,
          },
        },
      },
    ],
    [
      'self hosted',
      'Sentry login provider',
      'has synced a provider',
      {
        user: loggedInUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: false,
        isSelfHosted: true,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'Sentry login provider',
      'has not synced a provider',
      {
        user: loggedInUser,
        internalUser: internalUserNoSyncedProviders,
        termsOfServicePage: false,
        isSelfHosted: true,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: false,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
            redirectToSyncPage: true,
          },
        },
      },
    ],
  ])(
    '%s:',
    (
      _,
      termsFlagStatus,
      userType,
      {
        user,
        internalUser,
        termsOfServicePage,
        isSelfHosted,
        expected,
        defaultOrgSelectorPage,
      }
    ) => {
      describe(`${termsFlagStatus}`, () => {
        describe(`when called with ${userType} user`, () => {
          beforeEach(() => {
            config.IS_SELF_HOSTED = isSelfHosted
            setup({
              user,
              internalUser,
              termsOfServicePage,
              defaultOrgSelectorPage,
            })
          })

          it(`return values are expect while useUser resolves`, async () => {
            const { result } = renderHook(() => useUserAccessGate(), {
              wrapper: wrapper(['/gh?']),
            })

            await waitFor(() => result.current.isLoading)

            expect(result.current).toStrictEqual(expected.beforeSettled)

            await waitFor(() => result.current.isLoading)
            await waitFor(() => !result.current.isLoading)

            await waitFor(() =>
              expect(result.current).toStrictEqual(expected.afterSettled)
            )
          })
        })
      })
    }
  )

  describe('feature flag is on and set up action param is request', () => {
    beforeEach(() => {
      config.IS_SELF_HOSTED = false
    })

    it('renders children', async () => {
      setup({
        user: loggedInUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: true,
        defaultOrgSelectorPage: true,
      })

      const { result } = renderHook(() => useUserAccessGate(), {
        wrapper: wrapper(['/gh?setup_action=request']),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() => expect(testLocation.pathname).toBe('/gh/CodecovUser'))

      await waitFor(() =>
        expect(testLocation.search).toEqual('?setup_action=request')
      )
    })

    it('fires update default org mutation', async () => {
      const { mockMutationVariables } = setup({
        user: loggedInUser,
        internalUser: internalUserHasSyncedProviders,
        termsOfServicePage: true,
        defaultOrgSelectorPage: true,
      })

      const { result } = renderHook(() => useUserAccessGate(), {
        wrapper: wrapper(['/gh?setup_action=request']),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() =>
        expect(mockMutationVariables).toHaveBeenCalledWith({
          input: {
            username: 'CodecovUser',
          },
        })
      )
    })
  })
})
