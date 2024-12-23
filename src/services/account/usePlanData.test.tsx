import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { BillingRate, Plans } from 'shared/utils/billing'

import { usePlanData } from './usePlanData'

const mockTrialData = {
  hasPrivateRepos: true,
  plan: {
    baseUnitPrice: 10,
    benefits: [],
    billingRate: BillingRate.MONTHLY,
    marketingName: 'Users Basic',
    monthlyUploadLimit: 250,
    value: Plans.USERS_BASIC,
    trialStatus: 'ONGOING',
    trialStartDate: '2023-01-01T08:55:25',
    trialEndDate: '2023-01-10T08:55:25',
    trialTotalDays: 0,
    pretrialUsersCount: 0,
    planUserCount: 1,
    hasSeatsLeft: true,
    isEnterprisePlan: false,
    isFreePlan: true,
    isProPlan: false,
    isTeamPlan: false,
  },
  pretrialPlan: {
    baseUnitPrice: 10,
    benefits: [],
    billingRate: BillingRate.MONTHLY,
    marketingName: 'Users Basic',
    monthlyUploadLimit: 250,
    value: Plans.USERS_BASIC,
  },
}

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

describe('usePlanData', () => {
  function setup({ trialData }: { trialData: any }) {
    server.use(
      graphql.query('GetPlanData', () => {
        return HttpResponse.json({ data: { owner: { ...trialData } } })
      })
    )
  }

  describe('calling hook', () => {
    describe('there is plan data', () => {
      it('returns the plan data', async () => {
        setup({ trialData: mockTrialData })

        const { result } = renderHook(
          () =>
            usePlanData({
              provider: 'gh',
              owner: 'codecov',
            }),
          { wrapper }
        )

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            hasPrivateRepos: true,
            plan: {
              baseUnitPrice: 10,
              benefits: [],
              billingRate: BillingRate.MONTHLY,
              hasSeatsLeft: true,
              isEnterprisePlan: false,
              isFreePlan: true,
              isProPlan: false,
              isTeamPlan: false,
              marketingName: 'Users Basic',
              monthlyUploadLimit: 250,
              planUserCount: 1,
              pretrialUsersCount: 0,
              trialEndDate: '2023-01-10T08:55:25',
              trialStartDate: '2023-01-01T08:55:25',
              trialStatus: 'ONGOING',
              trialTotalDays: 0,
              value: Plans.USERS_BASIC,
            },
            pretrialPlan: {
              baseUnitPrice: 10,
              benefits: [],
              billingRate: BillingRate.MONTHLY,
              marketingName: 'Users Basic',
              monthlyUploadLimit: 250,
              value: Plans.USERS_BASIC,
            },
          })
        )
      })
    })

    describe('there is no plan data', () => {
      beforeAll(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterAll(() => {
        vi.restoreAllMocks()
      })

      it('returns an empty object', async () => {
        setup({ trialData: undefined })
        const { result } = renderHook(
          () =>
            usePlanData({
              provider: 'gh',
              owner: 'codecov',
            }),
          { wrapper }
        )

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({ status: 404 })
          )
        )
      })
    })
  })
})
