import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import noop from 'lodash/noop'
import { MemoryRouter, Route } from 'react-router-dom'
import { z } from 'zod'

import { PlanUpdatedPlanNotificationContext } from 'pages/PlanPage/context'
import { AccountDetailsSchema } from 'services/account'
import { AlertOptions, type AlertOptionsType } from 'ui/Alert'

import CurrentOrgPlan from './CurrentOrgPlan'

const mocks = vi.hoisted(() => ({
  useAccountDetails: vi.fn(),
}))

vi.mock('services/account', async () => {
  const actual = await vi.importActual('services/account')
  return {
    ...actual,
    useAccountDetails: mocks.useAccountDetails,
  }
})

vi.mock('./BillingDetails', () => ({ default: () => 'BillingDetails' }))
vi.mock('./CurrentPlanCard', () => ({ default: () => 'CurrentPlanCard' }))
vi.mock('./LatestInvoiceCard', () => ({ default: () => 'LatestInvoiceCard' }))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const mockedAccountDetails = {
  planProvider: 'github',
  rootOrganization: {},
  plan: {
    value: 'users-free',
  },
  usesInvoice: false,
} as z.infer<typeof AccountDetailsSchema>

const alertOptionWrapperCreator = (
  alertOptionString: AlertOptionsType | ''
) => {
  const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <MemoryRouter initialEntries={['/billing/gh/codecov']}>
      <Route path="/billing/:provider/:owner">
        <QueryClientProvider client={queryClient}>
          <PlanUpdatedPlanNotificationContext.Provider
            value={{
              updatedNotification: { alertOption: alertOptionString },
              setUpdatedNotification: noop,
            }}
          >
            {children}
          </PlanUpdatedPlanNotificationContext.Provider>
        </QueryClientProvider>
      </Route>
    </MemoryRouter>
  )
  return wrapper
}

const wrapper = alertOptionWrapperCreator(AlertOptions.SUCCESS)
const noUpdatedPlanWrapper = alertOptionWrapperCreator('')

describe('CurrentOrgPlan', () => {
  function setup({
    accountDetails = mockedAccountDetails,
  }: {
    accountDetails?: z.infer<typeof AccountDetailsSchema>
  }) {
    mocks.useAccountDetails.mockReturnValue({
      data: accountDetails,
    })
  }

  describe('when plan value and org root are provided', () => {
    beforeEach(() => {
      setup({})
    })

    it('renders CurrentPlanCard', () => {
      render(<CurrentOrgPlan />, { wrapper })
      expect(screen.getByText(/CurrentPlanCard/i)).toBeInTheDocument()
    })

    it('does not render LatestInvoiceCard', () => {
      render(<CurrentOrgPlan />, { wrapper })
      expect(screen.queryByText(/LatestInvoiceCard/i)).not.toBeInTheDocument()
    })

    it('does not render BillingDetails', () => {
      render(<CurrentOrgPlan />, { wrapper })
      expect(screen.queryByText(/BillingDetails/i)).not.toBeInTheDocument()
    })
  })

  describe('when plan update success banner should be shown', () => {
    it('renders banner for plan successfully updated', () => {
      setup({
        accountDetails: {
          plan: {
            baseUnitPrice: 12,
            billingRate: 'monthly',
            marketingName: 'Pro',
            quantity: 39,
            value: 'users-pr-inappm',
          },
        } as z.infer<typeof AccountDetailsSchema>,
      })

      render(<CurrentOrgPlan />, { wrapper })
      expect(screen.getByText('Plan successfully updated.')).toBeInTheDocument()
    })

    it('renders banner for plan successfully updated with scheduled details', () => {
      setup({
        accountDetails: {
          plan: {
            baseUnitPrice: 12,
            billingRate: 'monthly',
            marketingName: 'Pro',
            quantity: 39,
            value: 'users-pr-inappm',
          },
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
      expect(screen.getByText('Plan successfully updated.')).toBeInTheDocument()
      expect(
        screen.getByText(/with a monthly subscription for 34 seats/)
      ).toBeInTheDocument()
    })

    it('does not render banner when no recent update made', () => {
      setup({
        accountDetails: {
          plan: {
            baseUnitPrice: 12,
            billingRate: 'monthly',
            marketingName: 'Pro',
            quantity: 39,
            value: 'users-pr-inappm',
          },
        } as z.infer<typeof AccountDetailsSchema>,
      })
      render(<CurrentOrgPlan />, { wrapper: noUpdatedPlanWrapper })
      expect(
        screen.queryByText('Plan successfully updated.')
      ).not.toBeInTheDocument()
    })
  })

  describe('when info message cancellation should be shown', () => {
    it('renders when subscription detail data is available', () => {
      setup({
        accountDetails: {
          plan: {
            baseUnitPrice: 12,
            billingRate: 'monthly',
            marketingName: 'Pro',
            quantity: 39,
            value: 'users-pr-inappm',
          },
          subscriptionDetail: {
            cancelAtPeriodEnd: true,
            currentPeriodEnd: 1722631954,
          },
        } as z.infer<typeof AccountDetailsSchema>,
      })

      render(<CurrentOrgPlan />, { wrapper })
      expect(
        screen.getByText('Subscription Pending Cancellation')
      ).toBeInTheDocument()
    })
  })

  describe('when shouldRenderBillingDetails should be shown', () => {
    describe('when planProvider is not github and not root org', () => {
      beforeEach(() => {
        setup({
          accountDetails: {
            planProvider: 'gitlab',
            rootOrganization: null,
            plan: {
              value: 'users-free',
              baseUnitPrice: 12,
              benefits: ['a', 'b'],
              billingRate: '1',
              marketingName: 'bob',
            },
            usesInvoice: false,
          } as z.infer<typeof AccountDetailsSchema>,
        })
      })

      it('renders CurrentPlanCard', () => {
        render(<CurrentOrgPlan />, { wrapper })
        expect(screen.getByText(/CurrentPlanCard/i)).toBeInTheDocument()
      })

      it('renders LatestInvoiceCard', () => {
        render(<CurrentOrgPlan />, { wrapper })
        expect(screen.getByText(/LatestInvoiceCard/i)).toBeInTheDocument()
      })

      it('renders BillingDetails', () => {
        render(<CurrentOrgPlan />, { wrapper })
        expect(screen.getByText(/BillingDetails/i)).toBeInTheDocument()
      })
    })
    describe('when usesInvoice is true', () => {
      beforeEach(() => {
        setup({
          accountDetails: {
            planProvider: 'github',
            rootOrganization: {},
            plan: {
              value: 'users-free',
              baseUnitPrice: 12,
              benefits: ['a', 'b'],
              billingRate: '1',
              marketingName: 'bob',
            },
            usesInvoice: true,
          } as z.infer<typeof AccountDetailsSchema>,
        })
      })

      it('renders CurrentPlanCard', () => {
        render(<CurrentOrgPlan />, { wrapper })
        expect(screen.getByText(/CurrentPlanCard/i)).toBeInTheDocument()
      })

      it('renders LatestInvoiceCard', () => {
        render(<CurrentOrgPlan />, { wrapper })
        expect(screen.getByText(/LatestInvoiceCard/i)).toBeInTheDocument()
      })

      it('renders BillingDetails', () => {
        render(<CurrentOrgPlan />, { wrapper })
        expect(screen.getByText(/BillingDetails/i)).toBeInTheDocument()
      })
    })
  })

  describe('when plan value is not provided', () => {
    beforeEach(() => {
      setup({
        accountDetails: { plan: null } as z.infer<typeof AccountDetailsSchema>,
      })
    })

    it('does not render CurrentPlanCard', () => {
      render(<CurrentOrgPlan />, { wrapper })
      expect(screen.queryByText(/CurrentPlanCard/i)).not.toBeInTheDocument()
    })

    it('does not render LatestInvoiceCard', () => {
      render(<CurrentOrgPlan />, { wrapper })
      expect(screen.queryByText(/LatestInvoiceCard/i)).not.toBeInTheDocument()
    })

    it('does not render BillingDetails', () => {
      render(<CurrentOrgPlan />, { wrapper })
      expect(screen.queryByText(/BillingDetails/i)).not.toBeInTheDocument()
    })
  })

  describe('when user is a delinquent', () => {
    it('renders the delinquent banner', () => {
      setup({
        accountDetails: {
          ...mockedAccountDetails,
          delinquent: true,
        } as z.infer<typeof AccountDetailsSchema>,
      })

      render(<CurrentOrgPlan />, { wrapper })
      expect(
        screen.getByText('Your most recent payment failed')
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Please try a different card or contact support at support@codecov.io.'
        )
      ).toBeInTheDocument()
    })
  })
})
