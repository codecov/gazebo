import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAccountDetails } from 'services'

import CurrentOrgPlan from './CurrentOrgPlan'

jest.mock('services')
jest.mock('./PaymentCard', () => () => 'PaymentCard')
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
  rootOrganization: 'codecov',
  plan: {
    value: 'users-free',
  },
}

describe('CurrentOrgPlan', () => {
  function setup({ accountDetails = mockedAccountDetails } = {}) {
    useAccountDetails.mockReturnValue({
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
      setup()
    })

    it('renders CurrentPlanCard', () => {
      expect(screen.getByText(/CurrentPlanCard/i)).toBeInTheDocument()
    })

    it('does not render LatestInvoiceCard', () => {
      expect(screen.queryByText(/LatestInvoiceCard/i)).not.toBeInTheDocument()
    })

    it('does not render PaymentCard', () => {
      expect(screen.queryByText(/PaymentCard/i)).not.toBeInTheDocument()
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
          },
        },
      })
    })

    it('renders CurrentPlanCard', () => {
      expect(screen.getByText(/CurrentPlanCard/i)).toBeInTheDocument()
    })

    it('renders LatestInvoiceCard', () => {
      expect(screen.getByText(/LatestInvoiceCard/i)).toBeInTheDocument()
    })

    it('renders PaymentCard', () => {
      expect(screen.getByText(/PaymentCard/i)).toBeInTheDocument()
    })
  })

  describe('when plan value is not provided', () => {
    beforeEach(() => {
      setup({ accountDetails: { plan: null } })
    })

    it('does not render CurrentPlanCard', () => {
      expect(screen.queryByText(/CurrentPlanCard/i)).not.toBeInTheDocument()
    })

    it('does not render LatestInvoiceCard', () => {
      expect(screen.queryByText(/LatestInvoiceCard/i)).not.toBeInTheDocument()
    })

    it('does not render PaymentCard', () => {
      expect(screen.queryByText(/PaymentCard/i)).not.toBeInTheDocument()
    })
  })
})
