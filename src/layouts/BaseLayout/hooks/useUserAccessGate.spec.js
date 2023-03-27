import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useFlags } from 'shared/featureFlags'

import { useUserAccessGate } from './useUserAccessGate'

jest.mock('services/toastNotification')
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

const wrapper =
  (initialEntries = ['/gh']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

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

describe('useUserAccessGate', () => {
  function setup(
    { termsOfServicePage = false, user = loggedInUser } = {
      termsOfServicePage: false,
      user: loggedInUser,
    }
  ) {
    useFlags.mockReturnValue({ termsOfServicePage })
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
      'signed TOS',
      {
        user: loggedInUser,
        termsOfServicePage: true,
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
      'guest',
      {
        user: guestUser,
        termsOfServicePage: true,
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
      'legacy',
      {
        user: loggedInLegacyUser,
        termsOfServicePage: true,
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
      'unsigned TOS',
      {
        user: loggedInUnsignedUser,
        termsOfServicePage: true,
        isSelfHosted: false,
        expected: {
          beforeSettled: {
            isFullExperience: true,
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
      'self hosted',
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
  ])(
    '%s:',
    (_, userType, { user, termsOfServicePage, isSelfHosted, expected }) => {
      describe(`when called with ${userType} user`, () => {
        beforeEach(() => {
          config.IS_SELF_HOSTED = isSelfHosted
          setup({ termsOfServicePage, user })
        })
        it(`does not call addNotification`, async () => {
          const { result, waitFor } = renderHook(() => useUserAccessGate(), {
            wrapper: wrapper(['/gh']),
          })

          await waitFor(() => result.current.isLoading)

          expect(result.current).toStrictEqual(expected.beforeSettled)

          await waitFor(() => !result.current.isLoading)

          expect(result.current).toStrictEqual(expected.afterSettled)
        })
      })
    }
  )
})
