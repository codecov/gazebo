import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { usePlanData } from './usePlanData'

const mockTrialData = {
  hasPrivateRepos: true,
  plan: {
    baseUnitPrice: 10,
    benefits: [],
    billingRate: 'monthly',
    marketingName: 'Users Basic',
    monthlyUploadLimit: 250,
    value: 'users-basic',
    trialStatus: 'ONGOING',
    trialStartDate: '2023-01-01T08:55:25',
    trialEndDate: '2023-01-10T08:55:25',
    trialTotalDays: 0,
    pretrialUsersCount: 0,
    planUserCount: 1,
  },
  pretrialPlan: {
    baseUnitPrice: 10,
    benefits: [],
    billingRate: 'monthly',
    marketingName: 'Users Basic',
    monthlyUploadLimit: 250,
    value: 'users-basic',
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

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
      graphql.query('GetPlanData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner: { ...trialData } }))
      )
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
              billingRate: 'monthly',
              marketingName: 'Users Basic',
              monthlyUploadLimit: 250,
              value: 'users-basic',
              trialStatus: 'ONGOING',
              trialStartDate: '2023-01-01T08:55:25',
              trialEndDate: '2023-01-10T08:55:25',
              trialTotalDays: 0,
              pretrialUsersCount: 0,
              planUserCount: 1,
            },
            pretrialPlan: {
              baseUnitPrice: 10,
              benefits: [],
              billingRate: 'monthly',
              marketingName: 'Users Basic',
              monthlyUploadLimit: 250,
              value: 'users-basic',
            },
          })
        )
      })
    })

    describe('there is no plan data', () => {
      beforeEach(() => setup({ trialData: undefined }))

      it('returns an empty object', async () => {
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
