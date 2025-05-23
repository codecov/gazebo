import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { BillingRate, Plans } from 'shared/utils/billing'

import { useAvailablePlans } from './useAvailablePlans'

const mockAvailablePlans = [
  {
    marketingName: 'Basic',
    value: Plans.USERS_DEVELOPER,
    billingRate: null,
    baseUnitPrice: 0,
    benefits: [
      'Up to 5 users',
      'Unlimited public repositories',
      'Unlimited private repositories',
    ],
    monthlyUploadLimit: 250,
    isTeamPlan: false,
    isSentryPlan: false,
  },
  {
    marketingName: 'Pro Team',
    value: Plans.USERS_PR_INAPPM,
    billingRate: BillingRate.MONTHLY,
    baseUnitPrice: 12,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
    isTeamPlan: false,
    isSentryPlan: false,
  },
  {
    marketingName: 'Pro Team',
    value: Plans.USERS_PR_INAPPY,
    billingRate: BillingRate.ANNUALLY,
    baseUnitPrice: 10,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
    isTeamPlan: false,
    isSentryPlan: false,
  },
  {
    marketingName: 'Sentry Pro Team',
    value: Plans.USERS_SENTRYY,
    billingRate: BillingRate.ANNUALLY,
    baseUnitPrice: 10,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
    isTeamPlan: false,
    isSentryPlan: true,
  },
  {
    marketingName: 'Pro Team',
    value: Plans.USERS_ENTERPRISEM,
    billingRate: BillingRate.MONTHLY,
    baseUnitPrice: 12,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
    isTeamPlan: false,
    isSentryPlan: false,
  },
  {
    marketingName: 'Pro Team',
    value: Plans.USERS_ENTERPRISEY,
    billingRate: BillingRate.ANNUALLY,
    baseUnitPrice: 10,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
    isTeamPlan: false,
    isSentryPlan: false,
  },
  {
    marketingName: 'Team',
    value: Plans.USERS_TEAMM,
    billingRate: BillingRate.MONTHLY,
    baseUnitPrice: 6,
    benefits: ['Patch coverage analysis'],
    monthlyUploadLimit: null,
    isTeamPlan: true,
    isSentryPlan: false,
  },
]

const mockAvailablePlansRes = {
  owner: {
    availablePlans: mockAvailablePlans,
  },
}

const mockNullOwner = {
  owner: null,
}

const mockUnsuccessfulParseError = {}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  isNullOwner?: boolean
  isUnsuccessfulParseError?: boolean
}

describe('useAvailablePlans', () => {
  function setup({
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetAvailablePlans', () => {
        if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        } else {
          return HttpResponse.json({ data: mockAvailablePlansRes })
        }
      })
    )
  }

  describe('when useAvailablePlans is called', () => {
    describe('api returns valid response', () => {
      describe('tier field is resolved', () => {
        it('returns the owners available plans', async () => {
          setup({})
          const { result } = renderHook(
            () =>
              useAvailablePlans({
                provider: 'gh',
                owner: 'codecov',
              }),
            { wrapper }
          )

          await waitFor(() => result.current.isSuccess)
          await waitFor(() =>
            expect(result.current.data).toEqual(mockAvailablePlans)
          )
        })
      })

      describe('parent field is resolved as null', () => {
        it('returns null value', async () => {
          setup({ isNullOwner: true })

          const { result } = renderHook(
            () =>
              useAvailablePlans({
                provider: 'gh',
                owner: 'codecov',
              }),
            { wrapper }
          )

          await waitFor(() => expect(result.current.data).toBeNull())
        })
      })
    })

    describe('unsuccessful parse of zod schema', () => {
      beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterEach(() => {
        vi.restoreAllMocks()
      })

      it('throws a 400', async () => {
        setup({ isUnsuccessfulParseError: true })
        const { result } = renderHook(
          () =>
            useAvailablePlans({
              provider: 'gh',
              owner: 'codecov',
            }),
          { wrapper }
        )

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              dev: 'useAvailablePlans - Parsing Error',
              status: 400,
            })
          )
        )
      })
    })
  })
})
