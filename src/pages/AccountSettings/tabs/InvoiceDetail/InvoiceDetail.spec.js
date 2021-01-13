import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useInvoice } from 'services/account'
import InvoiceDetail from './InvoiceDetail'

jest.mock('services/account/hooks')

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
  invoicePdf:
    'https://pay.stripe.com/invoice/acct_14SJTOGlVGuVgOrk/invst_IfFo7ZObDS0WosDNKdA6ZlcEzZ4fDkS/pdf',
  lineItems: [
    {
      description: 'Unused time on 19 × users-pr-inappm after 30 Dec 2020',
      amount: -9449,
      currency: 'usd',
      period: { end: 1610473200, start: 1609298708 },
      planName: 'users-pr-inappm',
      quantity: 19,
    },
    {
      description: null,
      amount: 72000,
      currency: 'usd',
      period: { end: 1640834708, start: 1609298708 },
      planName: 'users-pr-inappy',
      quantity: 6,
    },
    {
      description: null,
      amount: 72000,
      currency: 'usd',
      period: { end: null, start: null },
      planName: 'same period doesnt render date',
      quantity: 1,
    },
  ],
  subscription: {
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
  },
}

describe('InvoiceDetail', () => {
  function setup(invoiceOver = {}) {
    useInvoice.mockReturnValue({
      data: {
        ...invoice,
        ...invoiceOver,
      },
    })
    render(<InvoiceDetail owner="codecov" provider="codecov" />, {
      wrapper: MemoryRouter,
    })
  }

  describe('when rendering', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the back button', () => {
      expect(screen.getByText(/back to:/i)).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: /invoice overview/i,
        })
      ).toBeInTheDocument()
    })

    it('renders the Codecov address', () => {
      expect(
        screen.getByText(
          /codecov llc9450 sw gemini drive#32076beaverton, or 97008-7105united states/i
        )
      ).toBeInTheDocument()
    })

    it('renders the number, currency, and date of the invoice', () => {
      expect(
        screen.getByText(/december 30th, 2020usd#ce3cef02-0008/i)
      ).toBeInTheDocument()
    })

    it('renders the items', () => {
      expect(
        screen.getByText(
          /\(6\) users-pr-inappy - period from december 30th 2020 to december 30th 2021/i
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /\(19\) users-pr-inappm - period from december 30th 2020 to january 12th 2021/i
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /unused time on 19 × users-pr-inappm after 30 dec 2020/i
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(/\(1\) same period doesnt render date/i)
      ).toBeInTheDocument()
    })

    it('renders the subtotal', () => {
      expect(screen.getByText(/sub total/i)).toBeInTheDocument()
      expect(screen.queryAllByText(/\$625\.51/i)[0]).toBeInTheDocument()
    })

    it('renders the address of the customer', () => {
      expect(screen.getByText(/checo perez/i)).toBeInTheDocument()
      expect(screen.getByText(/12 cours st-louis/i)).toBeInTheDocument()
      expect(screen.getByText(/apt-31/i)).toBeInTheDocument()
      expect(
        screen.getByText(/bordeaux gironde 33000 france/i)
      ).toBeInTheDocument()
    })

    it('renders the total', () => {
      expect(screen.queryAllByText(/\$625\.51/i)[1]).toBeInTheDocument()
    })
  })

  describe('when the invoice has a discount', () => {
    beforeEach(() => {
      setup({
        amountDue: 10000, // 100$
        subtotal: 9000, // 190$
        total: 9000,
      })
    })

    it('renders the discount', () => {
      expect(screen.getByText(/discount/i)).toBeInTheDocument()
      expect(screen.getByText(/\$-10.00/i)).toBeInTheDocument()
    })
  })
})
