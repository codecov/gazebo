import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { TrialStatuses } from 'services/account'
import { useFlags } from 'shared/featureFlags'

import TrialBanner from './TrialBanner'

jest.mock('config')
jest.mock('shared/featureFlags')

const mockedUseFlags = useFlags as jest.Mock<{ codecovTrialMvp: boolean }>

const proPlanMonth = {
  marketingName: 'Pro Team',
  value: 'users-pr-inappm',
  billingRate: 'monthly',
  baseUnitPrice: 12,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  quantity: 10,
}

const trialPlan = {
  marketingName: 'Trial Team',
  value: 'users-trial',
  billingRate: 'monthly',
  baseUnitPrice: 12,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  quantity: 10,
}

const basicPlan = {
  marketingName: 'Basic',
  value: 'users-basic',
  billingRate: null,
  baseUnitPrice: 0,
  benefits: [
    'Up to 1 user',
    'Unlimited public repositories',
    'Unlimited private repositories',
  ],
  quantity: 1,
}

const queryClient = new QueryClient()
const server = setupServer()

const wrapper =
  (
    initialEntries = '/gh/codecov',
    path = '/:provider/:owner'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path={path}>
            <Suspense fallback="Loading...">{children}</Suspense>
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
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

interface SetupArgs {
  trialStatus?: keyof typeof TrialStatuses
  isSentryPlan?: boolean
  flagValue?: boolean
  isCurrentUserPartOfOrg?: boolean
  isTrialPlan?: boolean
  isProPlan?: boolean
  trialStartDate?: string
  trialEndDate?: string
  isSelfHosted?: boolean
}

describe('TrialBanner', () => {
  function setup({
    trialStatus = TrialStatuses.NOT_STARTED,
    flagValue = false,
    isCurrentUserPartOfOrg = false,
    isTrialPlan = false,
    isProPlan = false,
    trialStartDate = '2021-01-01',
    trialEndDate = '20221-02-01',
    isSelfHosted = false,
  }: SetupArgs) {
    const user = userEvent.setup()

    mockedUseFlags.mockReturnValue({
      codecovTrialMvp: flagValue,
    })

    config.IS_SELF_HOSTED = isSelfHosted

    server.use(
      graphql.query('GetPlanData', (_, res, ctx) => {
        let plan: any = basicPlan

        if (isTrialPlan) {
          plan = trialPlan
        } else if (isProPlan) {
          plan = proPlanMonth
        }

        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              plan: {
                baseUnitPrice: plan.baseUnitPrice,
                benefits: plan.benefits,
                billingRate: null,
                marketingName: plan.marketingName,
                monthlyUploadLimit: null,
                planName: plan.value,
                trialStatus,
                trialStartDate,
                trialEndDate,
              },
            },
          })
        )
      }),
      graphql.query('DetailOwner', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({ owner: { isCurrentUserPartOfOrg } })
        )
      })
    )

    return {
      user,
    }
  }

  describe('when flag is enabled', () => {
    describe('owner is undefined', () => {
      it('renders nothing', async () => {
        setup({ flagValue: true })

        const { container } = render(<TrialBanner />, {
          wrapper: wrapper('/gh', '/:provider'),
        })

        expect(container).toBeEmptyDOMElement()
      })
    })

    describe('owner does not belong to org', () => {
      it('renders nothing', async () => {
        setup({ flagValue: true, isCurrentUserPartOfOrg: false })

        const { container } = render(<TrialBanner />, {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
        await waitFor(() => expect(queryClient.isFetching()).toBe(0))

        expect(container).toBeEmptyDOMElement()
      })
    })

    describe('trial is ongoing', () => {
      describe('trial is ongoing', () => {
        describe('date diff is less then 4', () => {
          it('renders ongoing banner', async () => {
            setup({
              flagValue: true,
              trialStatus: TrialStatuses.ONGOING,
              isCurrentUserPartOfOrg: true,
              isTrialPlan: true,
              trialStartDate: '2021-01-01',
              trialEndDate: '2021-01-02',
            })

            render(<TrialBanner />, {
              wrapper: wrapper(),
            })

            const text = await screen.findByText(
              /Your trial ends in 1 day\(s\)/
            )
            expect(text).toBeInTheDocument()
          })
        })

        describe('date diff is greater then 4', () => {
          it('renders nothing', async () => {
            setup({
              flagValue: true,
              trialStatus: TrialStatuses.ONGOING,
              isCurrentUserPartOfOrg: true,
              isTrialPlan: true,
              trialStartDate: '2021-01-01',
              trialEndDate: '2021-01-14',
            })

            const { container } = render(<TrialBanner />, {
              wrapper: wrapper(),
            })

            await waitFor(() =>
              expect(queryClient.isFetching()).toBeGreaterThan(0)
            )
            await waitFor(() => expect(queryClient.isFetching()).toBe(0))

            expect(container).toBeEmptyDOMElement()
          })
        })

        describe('date diff is less then 0', () => {
          it('renders nothing', async () => {
            setup({
              flagValue: true,
              trialStatus: TrialStatuses.ONGOING,
              isCurrentUserPartOfOrg: true,
              isTrialPlan: true,
              trialStartDate: '2021-01-02',
              trialEndDate: '2021-01-01',
            })

            const { container } = render(<TrialBanner />, {
              wrapper: wrapper(),
            })

            await waitFor(() =>
              expect(queryClient.isFetching()).toBeGreaterThan(0)
            )
            await waitFor(() => expect(queryClient.isFetching()).toBe(0))

            expect(container).toBeEmptyDOMElement()
          })
        })
      })
    })

    describe('trial is expired', () => {
      describe('user is on a free plan', () => {
        it('renders expired banner', async () => {
          setup({
            flagValue: true,
            trialStatus: TrialStatuses.EXPIRED,
            isCurrentUserPartOfOrg: true,
          })

          render(<TrialBanner />, {
            wrapper: wrapper(),
          })

          const banner = await screen.findByText(
            /The org's 14-day free Codecov Pro trial has ended./
          )
          expect(banner).toBeInTheDocument()
        })
      })

      describe('user is on a paid plan', () => {
        it('renders nothing', async () => {
          setup({
            flagValue: true,
            isProPlan: true,
            trialStatus: TrialStatuses.EXPIRED,
            isCurrentUserPartOfOrg: true,
          })

          const { container } = render(<TrialBanner />, {
            wrapper: wrapper(),
          })

          await waitFor(() =>
            expect(queryClient.isFetching()).toBeGreaterThan(0)
          )
          await waitFor(() => expect(queryClient.isFetching()).toBe(0))

          expect(container).toBeEmptyDOMElement()
        })
      })
    })

    describe('running in self hosted mode', () => {
      it('renders nothing', async () => {
        setup({
          flagValue: true,
          trialStatus: TrialStatuses.ONGOING,
          isCurrentUserPartOfOrg: true,
          isTrialPlan: true,
          trialStartDate: '2021-01-01',
          trialEndDate: '2021-01-02',
          isSelfHosted: true,
        })

        const { container } = render(<TrialBanner />, {
          wrapper: wrapper('/gh', '/:provider'),
        })

        expect(container).toBeEmptyDOMElement()
      })
    })
  })

  describe('when flag is disabled', () => {
    it('displays nothing', async () => {
      setup({ flagValue: false })

      const { container } = render(<TrialBanner />, { wrapper: wrapper() })

      await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
      await waitFor(() => expect(queryClient.isFetching()).toBe(0))

      expect(container).toBeEmptyDOMElement()
    })
  })
})
