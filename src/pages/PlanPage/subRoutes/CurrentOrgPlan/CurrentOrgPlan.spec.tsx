import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'
import { z } from 'zod'

import { AccountDetailsSchema, useAccountDetails } from 'services/account'

import CurrentOrgPlan from './CurrentOrgPlan'

jest.mock('services/account')
jest.mock('./BillingDetails', () => () => 'BillingDetails')
jest.mock('./CurrentPlanCard', () => () => 'CurrentPlanCard')
jest.mock('./LatestInvoiceCard', () => () => 'LatestInvoiceCard')

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
} as z.infer<typeof AccountDetailsSchema>

describe('CurrentOrgPlan', () => {
  function setup({
    accountDetails = mockedAccountDetails,
  }: {
    accountDetails?: z.infer<typeof AccountDetailsSchema>
  }) {
    const mockedUseAccountDetails = useAccountDetails as jest.Mock
    mockedUseAccountDetails.mockReturnValue({
      data: accountDetails,
    })

    render(
      <MemoryRouter initialEntries={['/billing/gh/codecov']}>
        <Route path="/billing/:provider/:owner">
          <QueryClientProvider client={queryClient}>
            <CurrentOrgPlan />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when plan value and org root are provided', () => {
    beforeEach(() => {
      setup({})
    })

    it('renders CurrentPlanCard', () => {
      expect(screen.getByText(/CurrentPlanCard/i)).toBeInTheDocument()
    })

    it('does not render LatestInvoiceCard', () => {
      expect(screen.queryByText(/LatestInvoiceCard/i)).not.toBeInTheDocument()
    })

    it('does not render BillingDetails', () => {
      expect(screen.queryByText(/BillingDetails/i)).not.toBeInTheDocument()
    })
  })

  describe('when shouldRenderBillingDetails is true', () => {
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
        } as z.infer<typeof AccountDetailsSchema>,
      })
    })

    it('renders CurrentPlanCard', () => {
      expect(screen.getByText(/CurrentPlanCard/i)).toBeInTheDocument()
    })

    it('renders LatestInvoiceCard', () => {
      expect(screen.getByText(/LatestInvoiceCard/i)).toBeInTheDocument()
    })

    it('renders BillingDetails', () => {
      expect(screen.getByText(/BillingDetails/i)).toBeInTheDocument()
    })
  })

  describe('when plan value is not provided', () => {
    beforeEach(() => {
      setup({
        accountDetails: { plan: null } as z.infer<typeof AccountDetailsSchema>,
      })
    })

    it('does not render CurrentPlanCard', () => {
      expect(screen.queryByText(/CurrentPlanCard/i)).not.toBeInTheDocument()
    })

    it('does not render LatestInvoiceCard', () => {
      expect(screen.queryByText(/LatestInvoiceCard/i)).not.toBeInTheDocument()
    })

    it('does not render BillingDetails', () => {
      expect(screen.queryByText(/BillingDetails/i)).not.toBeInTheDocument()
    })
  })
})
