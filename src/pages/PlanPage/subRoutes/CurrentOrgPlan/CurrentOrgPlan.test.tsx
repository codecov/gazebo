import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen } from '@testing-library/react'
import noop from 'lodash/noop'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'
import { z } from 'zod'

import { PlanUpdatedPlanNotificationContext } from 'pages/PlanPage/context'
import { AccountDetailsSchema } from 'services/account'
import { Plans } from 'shared/utils/billing'
import { AlertOptions, type AlertOptionsType } from 'ui/Alert'

import CurrentOrgPlan from './CurrentOrgPlan'
import { EnterpriseAccountDetailsRequestSchema } from './queries/EnterpriseAccountDetailsQueryOpts'

vi.mock('./BillingDetails', () => ({ default: () => 'BillingDetails' }))
vi.mock('./CurrentPlanCard', () => ({ default: () => 'CurrentPlanCard' }))
vi.mock('./LatestInvoiceCard', () => ({ default: () => 'LatestInvoiceCard' }))
vi.mock('./AccountOrgs', () => ({ default: () => 'AccountOrgs' }))

const mockedAccountDetails = {
  planProvider: 'github',
  rootOrganization: {},
  usesInvoice: false,
} as z.infer<typeof AccountDetailsSchema>

const mockNoEnterpriseAccount = {
  owner: {
    account: null,
  },
}

const mockEnterpriseAccountDetailsNinetyPercent = {
  owner: {
    account: {
      name: 'account-name',
      totalSeatCount: 10,
      activatedUserCount: 9,
      organizations: {
        totalCount: 3,
      },
    },
  },
}

const mockEnterpriseAccountDetails = {
  owner: {
    account: {
      name: 'account-name',
      totalSeatCount: 10,
      activatedUserCount: 5,
      organizations: {
        totalCount: 3,
      },
    },
  },
}

const mockEnterpriseAccountDetailsHundredPercent = {
  owner: {
    account: {
      name: 'account-name',
      totalSeatCount: 10,
      activatedUserCount: 10,
      organizations: {
        totalCount: 3,
      },
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const alertOptionWrapperCreator = (
  alertOptionString: AlertOptionsType | '',
  isCancellation?: boolean
) => {
  const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <MemoryRouter initialEntries={['/billing/gh/codecov']}>
      <Route path="/billing/:provider/:owner">
        <QueryClientProviderV5 client={queryClientV5}>
          <QueryClientProvider client={queryClient}>
            <Suspense fallback={<div>Loading</div>}>
              <PlanUpdatedPlanNotificationContext.Provider
                value={{
                  updatedNotification: {
                    alertOption: alertOptionString,
                    isCancellation,
                  },
                  setUpdatedNotification: noop,
                }}
              >
                {children}
              </PlanUpdatedPlanNotificationContext.Provider>
            </Suspense>
          </QueryClientProvider>
        </QueryClientProviderV5>
      </Route>
    </MemoryRouter>
  )
  return wrapper
}

const server = setupServer()
const wrapper = alertOptionWrapperCreator(AlertOptions.SUCCESS)
const noUpdatedPlanWrapper = alertOptionWrapperCreator('')
const cancellationPlanWrapper = alertOptionWrapperCreator('', true)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  accountDetails?: z.infer<typeof AccountDetailsSchema>
  enterpriseAccountDetails?: z.infer<
    typeof EnterpriseAccountDetailsRequestSchema
  >
}

describe('CurrentOrgPlan', () => {
  function setup({
    accountDetails = mockedAccountDetails,
    enterpriseAccountDetails = mockNoEnterpriseAccount,
  }: SetupArgs) {
    server.use(
      graphql.query('EnterpriseAccountDetails', () => {
        return HttpResponse.json({ data: enterpriseAccountDetails })
      }),
      graphql.query('CurrentOrgPlanPageData', () => {
        return HttpResponse.json({
          data: {
            owner: {
              plan: { value: Plans.USERS_PR_INAPPM },
              billing: {
                unverifiedPaymentMethods: [],
              },
            },
          },
        })
      }),
      http.get('/internal/:provider/:owner/account-details', () => {
        return HttpResponse.json(accountDetails)
      })
    )
  }

  describe('when plan value and org root are provided', () => {
    beforeEach(() => {
      setup({})
    })

    it('renders CurrentPlanCard', async () => {
      render(<CurrentOrgPlan />, { wrapper })
      const currentPlanCard = await screen.findByText(/CurrentPlanCard/i)
      expect(currentPlanCard).toBeInTheDocument()
    })

    it('does not render LatestInvoiceCard', async () => {
      render(<CurrentOrgPlan />, { wrapper })
      const latestInvoiceCard = screen.queryByText(/LatestInvoiceCard/i)
      expect(latestInvoiceCard).not.toBeInTheDocument()
    })

    it('does not render BillingDetails', async () => {
      render(<CurrentOrgPlan />, { wrapper })
      const billingDetails = screen.queryByText(/BillingDetails/i)
      expect(billingDetails).not.toBeInTheDocument()
    })
  })

  describe('when plan update success banner should be shown', () => {
    it('renders banner for plan successfully updated', async () => {
      setup({
        accountDetails: {} as z.infer<typeof AccountDetailsSchema>,
      })

      render(<CurrentOrgPlan />, { wrapper })
      const updatedAlert = await screen.findByText('Plan successfully updated.')
      expect(updatedAlert).toBeInTheDocument()
    })

    it('renders banner for plan successfully updated with scheduled details', async () => {
      setup({
        accountDetails: {
          scheduleDetail: {
            scheduledPhase: {
              quantity: 34,
              plan: 'monthly',
              startDate: 1722631954,
            },
          },
        } as z.infer<typeof AccountDetailsSchema>,
      })
      render(<CurrentOrgPlan />, { wrapper })
      const updatedAlert = await screen.findByText('Plan successfully updated.')
      expect(updatedAlert).toBeInTheDocument()
      expect(
        screen.getByText(/with a monthly subscription for 34 seats/)
      ).toBeInTheDocument()
    })

    it('does not render banner when no recent update made', async () => {
      setup({
        accountDetails: {} as z.infer<typeof AccountDetailsSchema>,
      })
      render(<CurrentOrgPlan />, { wrapper: noUpdatedPlanWrapper })
      const currentPlanCard = await screen.findByText(/CurrentPlanCard/i)
      expect(currentPlanCard).toBeInTheDocument()

      expect(
        screen.queryByText('Plan successfully updated.')
      ).not.toBeInTheDocument()
    })
  })

  describe('when info message cancellation should be shown', () => {
    it('renders when subscription detail data is available', async () => {
      setup({
        accountDetails: {
          subscriptionDetail: {
            cancelAtPeriodEnd: true,
            currentPeriodEnd: 1722631954,
          },
        } as z.infer<typeof AccountDetailsSchema>,
      })

      render(<CurrentOrgPlan />, { wrapper: cancellationPlanWrapper })
      const pendingCancellation = await screen.findByText(
        /on August 2nd 2024, 8:52 p.m./
      )
      expect(pendingCancellation).toBeInTheDocument()
    })
  })

  describe('when shouldRenderBillingDetails should be shown', () => {
    describe('when planProvider is not github and not root org', () => {
      beforeEach(() => {
        setup({
          accountDetails: {
            planProvider: 'gitlab',
            rootOrganization: null,
            usesInvoice: false,
          } as z.infer<typeof AccountDetailsSchema>,
        })
      })

      it('renders CurrentPlanCard', async () => {
        render(<CurrentOrgPlan />, { wrapper })
        const currentPlanCard = await screen.findByText(/CurrentPlanCard/i)
        expect(currentPlanCard).toBeInTheDocument()
      })

      it('renders LatestInvoiceCard', async () => {
        render(<CurrentOrgPlan />, { wrapper })
        const latestInvoiceCard = await screen.findByText(/LatestInvoiceCard/i)
        expect(latestInvoiceCard).toBeInTheDocument()
      })

      it('renders BillingDetails', async () => {
        render(<CurrentOrgPlan />, { wrapper })
        const billingDetails = await screen.findByText(/BillingDetails/i)
        expect(billingDetails).toBeInTheDocument()
      })
    })
    describe('when usesInvoice is true', () => {
      beforeEach(() => {
        setup({
          accountDetails: {
            planProvider: 'github',
            rootOrganization: {},
            usesInvoice: true,
          } as z.infer<typeof AccountDetailsSchema>,
        })
      })

      it('renders CurrentPlanCard', async () => {
        render(<CurrentOrgPlan />, { wrapper })
        const currentPlanCard = await screen.findByText(/CurrentPlanCard/i)
        expect(currentPlanCard).toBeInTheDocument()
      })

      it('renders LatestInvoiceCard', async () => {
        render(<CurrentOrgPlan />, { wrapper })
        const latestInvoiceCard = await screen.findByText(/LatestInvoiceCard/i)
        expect(latestInvoiceCard).toBeInTheDocument()
      })

      it('renders BillingDetails', async () => {
        render(<CurrentOrgPlan />, { wrapper })
        const billingDetails = await screen.findByText(/BillingDetails/i)
        expect(billingDetails).toBeInTheDocument()
      })
    })
  })

  describe('when plan value is not provided', () => {
    beforeEach(() => {
      setup({
        accountDetails: { ...mockedAccountDetails },
      })
    })

    it('does not render CurrentPlanCard', async () => {
      render(<CurrentOrgPlan />, { wrapper })
      const currentPlanCard = screen.queryByText(/CurrentPlanCard/i)
      expect(currentPlanCard).not.toBeInTheDocument()
    })

    it('does not render LatestInvoiceCard', async () => {
      render(<CurrentOrgPlan />, { wrapper })
      const latestInvoiceCard = screen.queryByText(/LatestInvoiceCard/i)
      expect(latestInvoiceCard).not.toBeInTheDocument()
    })

    it('does not render BillingDetails', async () => {
      render(<CurrentOrgPlan />, { wrapper })
      const billingDetails = screen.queryByText(/BillingDetails/i)
      expect(billingDetails).not.toBeInTheDocument()
    })
  })

  describe('when user is a delinquent', () => {
    it('renders the delinquent banner', async () => {
      setup({
        accountDetails: {
          ...mockedAccountDetails,
          delinquent: true,
        } as z.infer<typeof AccountDetailsSchema>,
      })

      render(<CurrentOrgPlan />, { wrapper })
      const paymentFailed = await screen.findByText(
        'Your most recent payment failed'
      )
      expect(paymentFailed).toBeInTheDocument()
      const contactSupport = await screen.findByText(
        'Please try a different payment method or contact support at support@codecov.io.'
      )
      expect(contactSupport).toBeInTheDocument()
    })
  })

  describe('when owner has an account', () => {
    describe('and less than 90% of seats are in use', () => {
      it('does not render a usage banner', async () => {
        setup({
          enterpriseAccountDetails: mockEnterpriseAccountDetails,
        })

        render(<CurrentOrgPlan />, { wrapper })

        const currentPlanCard = await screen.findByText(/CurrentPlanCard/i)
        expect(currentPlanCard).toBeInTheDocument()

        const banner = screen.queryByText(/of its seats/)
        expect(banner).not.toBeInTheDocument()
      })
    })
    describe('and 100% of seats are in use', () => {
      it('renders 100% usage banner', async () => {
        setup({
          enterpriseAccountDetails: mockEnterpriseAccountDetailsHundredPercent,
        })
        render(<CurrentOrgPlan />, { wrapper })

        const banner = await screen.findByText(
          /Your account is using 100% of its seats/
        )
        expect(banner).toBeInTheDocument()
      })
    })

    describe('and seats used is >= 90%', () => {
      it('renders 90% usage banner', async () => {
        setup({
          enterpriseAccountDetails: mockEnterpriseAccountDetailsNinetyPercent,
        })

        render(<CurrentOrgPlan />, { wrapper })
        const banner = await screen.findByText(
          /Your account is using 90% of its seats/
        )
        expect(banner).toBeInTheDocument()
      })
    })

    it('renders AccountOrgs', async () => {
      setup({ enterpriseAccountDetails: mockEnterpriseAccountDetails })
      render(<CurrentOrgPlan />, { wrapper })

      const accountOrgs = await screen.findByText(/AccountOrgs/)
      expect(accountOrgs).toBeInTheDocument()
    })
  })
})
