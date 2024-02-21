import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useUserAccessGate } from './useUserAccessGate'

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
    owner: {
      defaultOrgUsername?: string
    }
    user: {
      username: string
      email: string
      name: string
      avatarUrl: string
      termsAgreement?: boolean
      customerIntent?: 'PERSONAL' | 'BUSINESS'
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
  avatarUrl: 'http://127.0.0.1/avatar-url',
  termsAgreement: false,
  owners: [],
}

const loggedInLegacyUser = {
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
    owner: {
      defaultOrgUsername: 'codecov',
    },
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
  termsAgreement: null,
  owners: [],
}

const internalUserHasSyncedProviders = {
  email: userSignedInIdentity.email,
  name: userSignedInIdentity.name,
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
  email: userSignedInIdentity.email,
  name: userSignedInIdentity.name,
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
  email: userSignedInIdentity.email,
  name: userSignedInIdentity.name,
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
  user: UserPartial
  internalUser: InternalUser
}

describe('useUserAccessGate', () => {
  function setup(
    {
      user = loggedInUser,
      internalUser = internalUserHasSyncedProviders,
    }: SetupArgs = {
      user: loggedInUser,
      internalUser: internalUserHasSyncedProviders,
    }
  ) {
    const mockMutationVariables = jest.fn()

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
      'default org',
      'does not have a default org',
      {
        user: loggedInUser,
        internalUser: internalUserWithSignedTOS,
        isSelfHosted: false,
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
            showDefaultOrgSelector: true,
            redirectToSyncPage: false,
          },
        },
      },
    ],
    [
      'cloud',
      'default org',
      'has a default org',
      {
        user: userHasDefaultOrg,
        internalUser: internalUserWithSignedTOS,
        isSelfHosted: false,
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
        user: userHasDefaultOrg,
        internalUser: internalUserHasSyncedProviders,
        isSelfHosted: false,
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
        user: userHasDefaultOrg,
        internalUser: internalUserNoSyncedProviders,
        isSelfHosted: false,
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
        isSelfHosted: true,
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
      'default org',
      'does not have a default org',
      {
        user: loggedInUser,
        internalUser: internalUserWithSignedTOS,
        isSelfHosted: true,
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
      'default org',
      'has a default org',
      {
        user: userHasDefaultOrg,
        internalUser: internalUserWithSignedTOS,
        isSelfHosted: true,
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
        isSelfHosted: true,
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

  describe('customer intent functionality', () => {
    describe('when customer intent is set to PERSONAL', () => {
      it('fires update default org mutation', async () => {
        const username = 'chetney'
        const { mockMutationVariables } = setup({
          user: {
            me: {
              owner: {
                defaultOrgUsername: '',
              },
              user: {
                ...userSignedInIdentity,
                username,
                termsAgreement: false,
                customerIntent: 'PERSONAL',
              },
              trackingMetadata: { ownerid: 123 },
              ...userSignedInIdentity,
              termsAgreement: true,
            },
          },
          internalUser: internalUserHasSyncedProviders,
        })

        const { result } = renderHook(() => useUserAccessGate(), {
          wrapper: wrapper(['/gh']),
        })

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(mockMutationVariables).toHaveBeenLastCalledWith({
            input: {
              username,
            },
          })
        )
      })
    })

    describe('when customer intent is set to BUSINESS', () => {
      it('does not fire update default org mutation', async () => {
        const username = 'chetney'

        const { mockMutationVariables } = setup({
          user: {
            me: {
              owner: {
                defaultOrgUsername: '',
              },
              user: {
                ...userSignedInIdentity,
                username,
                termsAgreement: false,
                customerIntent: 'BUSINESS',
              },
              trackingMetadata: { ownerid: 123 },
              ...userSignedInIdentity,
              termsAgreement: true,
            },
          },
          internalUser: internalUserHasSyncedProviders,
        })

        const { result } = renderHook(() => useUserAccessGate(), {
          wrapper: wrapper(['/gh']),
        })

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(mockMutationVariables).not.toHaveBeenCalled()
        )
      })
    })
  })
})
