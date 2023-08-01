import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
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

type Setup = {
  termsOfServicePage: boolean
  user: UserPartial
  defaultOrgSelectorPage: boolean
}

describe('useUserAccessGate', () => {
  function setup(
    {
      termsOfServicePage = false,
      user = loggedInUser,
      defaultOrgSelectorPage = false,
    }: Setup = {
      termsOfServicePage: false,
      user: loggedInUser,
      defaultOrgSelectorPage: false,
    }
  ) {
    const mockedUseFlags = jest.mocked(useFlags)

    mockedUseFlags.mockReturnValue({
      termsOfServicePage,
      defaultOrgSelectorPage,
    })

    server.use(
      graphql.query('CurrentUser', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(user))
      })
    )
  }

  afterEach(() => jest.resetAllMocks)

  describe.each([
    [
      'cloud',
      'TOS feature flag: ON',
      'signed TOS',
      {
        user: loggedInUser,
        termsOfServicePage: true,
        isSelfHosted: false,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
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
        termsOfServicePage: true,
        isSelfHosted: false,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
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
        termsOfServicePage: false,
        isSelfHosted: false,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
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
        termsOfServicePage: false,
        isSelfHosted: false,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
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
        termsOfServicePage: true,
        isSelfHosted: false,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
          },
          afterSettled: {
            isFullExperience: false,
            isLoading: false,
            showAgreeToTerms: true,
            showDefaultOrgSelector: false,
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
        termsOfServicePage: false,
        isSelfHosted: false,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
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
        termsOfServicePage: false,
        isSelfHosted: false,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
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
        termsOfServicePage: false,
        isSelfHosted: false,
        defaultOrgSelectorPage: true,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
          },
          afterSettled: {
            isFullExperience: false,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: true,
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
        termsOfServicePage: false,
        isSelfHosted: false,
        defaultOrgSelectorPage: true,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
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
        termsOfServicePage: true,
        isSelfHosted: true,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
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
        termsOfServicePage: true,
        isSelfHosted: true,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
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
        termsOfServicePage: true,
        isSelfHosted: true,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
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
        termsOfServicePage: true,
        isSelfHosted: true,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: true,
            showDefaultOrgSelector: false,
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
        termsOfServicePage: false,
        isSelfHosted: true,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
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
        termsOfServicePage: false,
        isSelfHosted: true,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
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
        termsOfServicePage: false,
        isSelfHosted: true,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
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
        termsOfServicePage: false,
        isSelfHosted: true,
        defaultOrgSelectorPage: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
            showAgreeToTerms: false,
            showDefaultOrgSelector: false,
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
              termsOfServicePage,
              user,
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
    it('renders children', async () => {
      setup({
        user: loggedInUser,
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
  })
})
