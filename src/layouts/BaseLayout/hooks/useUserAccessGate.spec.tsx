import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useLocationParams } from 'services/navigation'
import { useFlags } from 'shared/featureFlags'

import { useUserAccessGate } from './useUserAccessGate'

jest.mock('shared/featureFlags')
jest.spyOn(console, 'error')
jest.mock('services/navigation/useLocationParams')

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
  setupAction: string
}

describe('useUserAccessGate', () => {
  function setup(
    {
      termsOfServicePage = false,
      user = loggedInUser,
      setupAction = '',
    }: Setup = {
      termsOfServicePage: false,
      user: loggedInUser,
      setupAction: '',
    }
  ) {
    const mockedUseFlags = jest.mocked(useFlags)
    const mockedLocationParams = jest.mocked(useLocationParams)

    mockedUseFlags.mockReturnValue({ termsOfServicePage })
    mockedLocationParams.mockReturnValue({
      params: { setup_action: setupAction },
      setParams: jest.fn(),
      updateParams: jest.fn(),
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
      'feature flag: ON',
      'signed TOS',
      {
        user: loggedInUser,
        termsOfServicePage: true,
        isSelfHosted: false,
        expected: {
          beforeSettled: {
            isFullExperience: false,
            isLoading: true,
          },
          afterSettled: {
            isFullExperience: false,
            isLoading: false,
          },
        },
      },
    ],
    [
      'cloud',
      'feature flag: ON',
      'guest',
      {
        user: guestUser,
        termsOfServicePage: true,
        isSelfHosted: false,
        expected: {
          beforeSettled: {
            isFullExperience: false,
            isLoading: true,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
          },
        },
      },
    ],
    [
      'cloud',
      'feature flag: OFF',
      'signed TOS',
      {
        user: loggedInUser,
        termsOfServicePage: false,
        isSelfHosted: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
          },
        },
      },
    ],
    [
      'cloud',
      'feature flag: OFF',
      'guest',
      {
        user: guestUser,
        termsOfServicePage: false,
        isSelfHosted: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
          },
        },
      },
    ],
    [
      'cloud',
      'feature flag: OFF',
      'legacy',
      {
        user: loggedInLegacyUser,
        termsOfServicePage: false,
        isSelfHosted: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
          },
        },
      },
    ],
    [
      'cloud',
      'feature flag: OFF',
      'unsigned TOS',
      {
        user: loggedInUnsignedUser,
        termsOfServicePage: false,
        isSelfHosted: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'feature flag: ON',
      'signed TOS',
      {
        user: loggedInUser,
        termsOfServicePage: true,
        isSelfHosted: true,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'feature flag: ON',
      'guest',
      {
        user: guestUser,
        termsOfServicePage: true,
        isSelfHosted: true,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'feature flag: ON',
      'legacy',
      {
        user: loggedInLegacyUser,
        termsOfServicePage: true,
        isSelfHosted: true,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'feature flag: ON',
      'unsigned TOS',
      {
        user: loggedInUnsignedUser,
        termsOfServicePage: true,
        isSelfHosted: true,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'feature flag: OFF',
      'signed TOS',
      {
        user: loggedInUser,
        termsOfServicePage: false,
        isSelfHosted: true,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'feature flag: OFF',
      'guest',
      {
        user: guestUser,
        termsOfServicePage: false,
        isSelfHosted: true,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'feature flag: OFF',
      'legacy',
      {
        user: loggedInLegacyUser,
        termsOfServicePage: false,
        isSelfHosted: true,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
          },
        },
      },
    ],
    [
      'self hosted',
      'feature flag: OFF',
      'unsigned TOS',
      {
        user: loggedInUnsignedUser,
        termsOfServicePage: false,
        isSelfHosted: true,
        expected: {
          beforeSettled: {
            isFullExperience: true,
            isLoading: true,
          },
          afterSettled: {
            isFullExperience: true,
            isLoading: false,
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
      { user, termsOfServicePage, isSelfHosted, expected }
    ) => {
      describe(`${termsFlagStatus}`, () => {
        describe(`when called with ${userType} user`, () => {
          beforeEach(() => {
            config.IS_SELF_HOSTED = isSelfHosted
            setup({ termsOfServicePage, user, setupAction: '' })
          })
          it(`return values are expect while useUser resolves`, async () => {
            const { result } = renderHook(() => useUserAccessGate(), {
              wrapper: wrapper(['/gh']),
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

  describe('feature flag is on and default org exists', () => {
    it('renders children', async () => {
      setup({
        user: loggedInUser,
        termsOfServicePage: true,
        setupAction: 'request',
      })

      const { result } = renderHook(() => useUserAccessGate(), {
        wrapper: wrapper(['/gh']),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() => expect(testLocation.pathname).toBe('/gh/CodecovUser'))

      await waitFor(() =>
        expect(testLocation.search).toEqual('?setup_action=request')
      )
    })
  })

  describe('feature flag is on and default org exist', () => {
    it('renders full experience set to true', async () => {
      setup({ user: loggedInUser, termsOfServicePage: true, setupAction: '' })

      const { result } = renderHook(() => useUserAccessGate(), {
        wrapper: wrapper(['/gh']),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() => expect(result.current.isFullExperience).toBe(true))
    })
  })
})
