import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { delay, graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { User } from 'services/user'
import { Plans } from 'shared/utils/billing'

import { useUserAccessGate } from './useUserAccessGate'

vi.spyOn(console, 'error')

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

const testLocation: { pathname: string; search: string } = {
  pathname: '',
  search: '',
}

type WrapperClosure = (
  initialEntries?: string[]
) => React.FC<React.PropsWithChildren>

const wrapper: WrapperClosure =
  (initialEntries = ['/gh']) =>
  ({ children }) => (
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

const mockUser = {
  name: 'codecov',
  username: 'CodecovUser',
  avatarUrl: 'http://photo.com/codecov.png',
  avatar: 'http://photo.com/codecov.png',
  student: false,
  studentCreatedAt: null,
  studentUpdatedAt: null,
  email: 'codecov@codecov.io',
}

const mockTrackingMetadata = {
  service: 'github',
  ownerid: 123,
  serviceId: '123',
  plan: Plans.USERS_BASIC,
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

const loggedInLegacyUser = {
  me: {
    ...mockMe,
    owner: {
      defaultOrgUsername: 'codecov',
    },
    user: {
      ...mockUser,
      termsAgreement: null,
    },
    termsAgreement: null,
  },
}

const loggedInUnsignedUser = {
  me: {
    ...mockMe,
    owner: {
      defaultOrgUsername: 'codecov',
    },
    user: {
      ...mockUser,
      termsAgreement: false,
    },
    termsAgreement: false,
  },
}

const guestUser = {
  me: null,
}

const internalUserNoSyncedProviders = {
  email: mockUser.email,
  name: mockUser.name,
  externalId: '123',
  termsAgreement: null,
  owners: [],
}

const internalUserHasSyncedProviders = {
  email: mockUser.email,
  name: mockUser.name,
  externalId: '123',
  termsAgreement: true,
  owners: [
    {
      ownerid: 1,
      name: 'cool-owner',
      service: 'github',
      avatarUrl: 'http://127.0.0.1/avatar-url',
      username: 'cool-user',
      integrationId: 1,
      stats: null,
    },
  ],
}

const internalUserWithSignedTOS = {
  email: mockUser.email,
  name: mockUser.name,
  externalId: '123',
  owners: [
    {
      ownerid: 1,
      name: 'cool-owner',
      service: 'github',
      avatarUrl: 'http://127.0.0.1/avatar-url',
      username: 'cool-user',
      integrationId: 1,
      stats: null,
    },
  ],
  termsAgreement: true,
}

const internalUserWithUnsignedTOS = {
  email: mockUser.email,
  name: mockUser.name,
  externalId: '123',
  owners: [
    {
      ownerid: 1,
      name: 'cool-owner',
      service: 'github',
      avatarUrl: 'http://127.0.0.1/avatar-url',
      username: 'cool-user',
      integrationId: 1,
      stats: null,
    },
  ],
  termsAgreement: false,
}

type InternalUser =
  | typeof internalUserNoSyncedProviders
  | typeof internalUserHasSyncedProviders
  | null

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
  user?: User
  internalUser?: InternalUser
  delayMutation?: boolean
}

describe('useUserAccessGate', () => {
  function setup(
    {
      delayMutation = false,
      user = loggedInUser,
      internalUser = internalUserHasSyncedProviders,
    }: SetupArgs = {
      user: loggedInUser,
      internalUser: internalUserHasSyncedProviders,
    }
  ) {
    const mockMutationVariables = vi.fn()

    server.use(
      http.get('/internal/user', () => {
        return HttpResponse.json(internalUser)
      }),

      graphql.query('CurrentUser', () => {
        return HttpResponse.json({ data: user })
      }),
      graphql.mutation('updateDefaultOrganization', async (info) => {
        mockMutationVariables(info.variables)

        if (delayMutation) {
          await delay(1000)
          return HttpResponse.json({})
        }

        return HttpResponse.json({
          data: {
            updateDefaultOrganization: {
              defaultOrg: {
                username: 'criticalRole',
              },
            },
          },
        })
      })
    )

    return {
      mockMutationVariables,
    }
  }

  afterEach(() => vi.resetAllMocks)

  describe.each([
    [
      'cloud',
      'TOS',
      'signed TOS',
      {
        user: userHasDefaultOrg,
        internalUser: internalUserWithSignedTOS,
        isSelfHosted: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'cloud',
      'TOS',
      'legacy',
      {
        user: loggedInLegacyUser,
        internalUser: internalUserHasSyncedProviders,
        isSelfHosted: true,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'cloud',
      'TOS',
      'guest',
      {
        user: guestUser,
        internalUser: null,
        isSelfHosted: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'cloud',
      'TOS',
      'unsigned TOS',
      {
        user: loggedInUnsignedUser,
        internalUser: internalUserWithUnsignedTOS,
        isSelfHosted: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: false,
            isLoading: false,
            showAgreeToTerms: true,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'TOS',
      'signed TOS',
      {
        user: loggedInUser,
        internalUser: internalUserHasSyncedProviders,
        isSelfHosted: true,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'TOS',
      'guest',
      {
        user: guestUser,
        internalUser: internalUserHasSyncedProviders,
        isSelfHosted: true,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'TOS',
      'legacy',
      {
        user: loggedInLegacyUser,
        internalUser: internalUserHasSyncedProviders,
        isSelfHosted: true,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'TOS',
      'unsigned TOS',
      {
        user: loggedInUnsignedUser,
        internalUser: internalUserHasSyncedProviders,
        isSelfHosted: true,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
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
        user: userHasDefaultOrg,
        internalUser: internalUserHasSyncedProviders,
        isSelfHosted: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
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
        user: userHasDefaultOrg,
        internalUser: internalUserNoSyncedProviders,
        isSelfHosted: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: false,
            isLoading: false,
            showAgreeToTerms: false,
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
        isSelfHosted: true,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
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
        isSelfHosted: true,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            redirectToSyncPage: false,
          },
          afterSettled: {
            isFullExperience: false,
            isLoading: false,
            showAgreeToTerms: false,
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
      { user, internalUser, isSelfHosted, expected }
    ) => {
      describe(`${termsFlagStatus}`, () => {
        describe(`when called with ${userType} user`, () => {
          beforeEach(() => {
            config.IS_SELF_HOSTED = isSelfHosted
            setup({
              user,
              internalUser,
            })
          })

          it(`return values are expect while useUser resolves`, async () => {
            const { result } = renderHook(() => useUserAccessGate(), {
              wrapper: wrapper(),
            })

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
        internalUser: internalUserHasSyncedProviders,
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
        internalUser: internalUserHasSyncedProviders,
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
