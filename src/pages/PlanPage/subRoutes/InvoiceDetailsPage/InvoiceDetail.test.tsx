import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { ThemeContextProvider } from 'shared/ThemeContext/ThemeContext'
import { Plans } from 'shared/utils/billing'

import InvoiceDetail from './InvoiceDetail'
const mocks = vi.hoisted(() => ({
  useAccountDetails: vi.fn(),
  useInvoice: vi.fn(),
}))

vi.mock('services/account/useInvoice', async () => {
  const actual = await vi.importActual('services/account/useInvoice')
  return {
    ...actual,
    useInvoice: mocks.useInvoice,
  }
})

vi.mock('services/account/useAccountDetails', async () => {
  const actual = await vi.importActual('services/account/useAccountDetails')
  return {
    ...actual,
    useAccountDetails: mocks.useAccountDetails,
  }
})

const invoice = {
  id: 'in_1I3vJAGlVGuVgOrk5h77hHRa',
  number: 'CE3CEF02-0008',
  status: 'paid',
  created: 1609298708,
  periodStart: 1609298708,
  periodEnd: 1609298708,
  dueDate: 1611890708,
  currency: 'usd',
  amountPaid: 0,
  amountDue: 0,
  amountRemaining: 0,
  total: 62551,
  subtotal: 62551,
  defaultPaymentMethod: {
    card: {
      brand: 'visa',
      expMonth: 12,
      expYear: 2021,
      last4: '4242',
    },
  },
  invoicePdf:
    'https://pay.stripe.com/invoice/acct_14SJTOGlVGuVgOrk/invst_IfFo7ZObDS0WosDNKdA6ZlcEzZ4fDkS/pdf',
  lineItems: [
    {
      description: 'Unused time on 19 × users-pr-inappm after 30 Dec 2020',
      amount: -9449,
      currency: 'usd',
      period: { end: 1610473200, start: 1609298708 },
      value: Plans.USERS_PR_INAPPM,
      quantity: 19,
    },
    {
      description: null,
      amount: 72000,
      currency: 'usd',
      period: { end: 1640834708, start: 1609298708 },
      value: Plans.USERS_PR_INAPPY,
      quantity: 6,
    },
    {
      description: null,
      amount: 72000,
      currency: 'usd',
      period: { end: null, start: null },
      value: null,
      quantity: 1,
    },
  ],
  taxIds: [{ value: 'CA BN 123456789' }],
}

const subscriptionDetail = {
  latestInvoice: 'in_1I3vJAGlVGuVgOrk5h77hHRa',
  defaultPaymentMethod: {
    card: {
      brand: 'visa',
      expMonth: 12,
      expYear: 2021,
      last4: '4242',
    },
    billingDetails: {
      address: {
        city: 'Bordeaux',
        country: 'France',
        line1: '12 cours st-louis',
        line2: 'apt-31',
        postalCode: '33000',
        state: 'Gironde',
      },
      email: null,
      name: 'Checo perez',
      phone: null,
    },
  },
  cancelAtPeriodEnd: false,
  currentPeriodEnd: 1640834708,
  customer: 'cus_IVd2T7puVJe1Ur',
}

describe('InvoiceDetail', () => {
  function setup(invoiceOver = {}, url = '', subscriptionOver = {}) {
    mocks.useInvoice.mockReturnValue({
      data: {
        ...invoice,
        ...invoiceOver,
      },
    })
    mocks.useAccountDetails.mockReturnValue({
      data: {
        subscriptionDetail: {
          ...subscriptionOver,
          ...subscriptionDetail,
        },
      },
    })
    render(
      <MemoryRouter initialEntries={[url]}>
        <ThemeContextProvider>
          <InvoiceDetail />
        </ThemeContextProvider>
      </MemoryRouter>
    )
  }

  describe('when rendering', () => {
    it('renders the Codecov address', () => {
      setup()
      expect(
        screen.getByText(/Functional Software, dba Sentry/i)
      ).toBeInTheDocument()
      expect(screen.getByText(/45 Fremont St. 8th Floor/i)).toBeInTheDocument()
      expect(screen.getByText(/San Francisco, CA 94105/i)).toBeInTheDocument()
      expect(screen.getByText(/United States/i)).toBeInTheDocument()
      expect(screen.getByText(/support@codecov.io/i)).toBeInTheDocument()
    })

    it('renders the items', () => {
      setup()
      expect(
        screen.getByText(
          /unused time on 19 × users-pr-inappm after 30 dec 2020/i
        )
      ).toBeInTheDocument()
    })

    it('renders the default payment method if exists', () => {
      setup()
      expect(screen.getByText(/Payment Method/i)).toBeInTheDocument()
      expect(screen.getByText(/Ending in: 4242/i)).toBeInTheDocument()
      expect(screen.getByText(/Expiring on: 12\/2021/i)).toBeInTheDocument()
    })

    it('does not render the default payment method if does not exist', async () => {
      setup({ defaultPaymentMethod: null })
      await waitFor(() => {
        expect(screen.queryByText(/Payment method/)).not.toBeInTheDocument()
      })
    })

    it('renders the subtotal', () => {
      setup()
      expect(screen.getByText(/subtotal/i)).toBeInTheDocument()
      expect(screen.getAllByText(/\$625\.51/i)[0]).toBeInTheDocument()
    })

    it('renders the address of the customer', () => {
      setup()
      expect(screen.getByText(/Bill to/i)).toBeInTheDocument()
      expect(screen.getByText(/checo perez/i)).toBeInTheDocument()
      expect(screen.getByText(/12 cours st-louis/i)).toBeInTheDocument()
      expect(screen.getByText(/apt-31/i)).toBeInTheDocument()
      expect(
        screen.getByText(/bordeaux gironde 33000 france/i)
      ).toBeInTheDocument()
    })

    it('renders the tax information for customer if exists', () => {
      setup()
      expect(screen.getByText(/Tax information/i)).toBeInTheDocument()
      expect(screen.getByText(/CA BN 123456789/i)).toBeInTheDocument()
    })

    it('does not render the tax information for customer if does not exist', async () => {
      setup({ taxIds: [] })

      await waitFor(() => {
        expect(screen.queryByText(/Tax information/)).not.toBeInTheDocument()
      })
    })

    it('renders the total', () => {
      setup()
      expect(screen.getAllByText(/\$625\.51/i)[1]).toBeInTheDocument()
    })
  })

  describe('when ?print is in the URL', () => {
    beforeEach(() => {
      window.print = vi.fn()
      setup({}, '/invoice/123?print')
    })

    it('prompts the user for printing', () => {
      expect(window.print).toHaveBeenCalled()
    })
  })

  describe('when there are no subscriptionDetail', () => {
    beforeEach(() => {
      setup({}, '/invoice/123', {
        subscriptionDetail: null,
      })
    })

    it('renders the total', () => {
      expect(screen.getAllByText(/\$625\.51/i)[1]).toBeInTheDocument()
    })
  })

  describe('when the invoice has a discount', () => {
    beforeEach(() => {
      setup({
        amountDue: 10000, // $100
        subtotal: 9000, // $90
        total: 9000,
      })
    })

    it('renders the discount', () => {
      expect(screen.getByText(/Discount/i)).toBeInTheDocument()
      expect(screen.getByText(/\$-10.00/i)).toBeInTheDocument()
    })
  })
})
