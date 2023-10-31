import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import InvoiceHeader from './InvoiceHeader'

const mockInvoice = ({ status = 'paid' } = {}) => {
  return {
    id: 'in_1I3vJAGlVGuVgOrk5h77hHRa',
    number: 'CE3CEF02-0008',
    status,
    created: 1609298708,
    periodStart: 1609298708,
    periodEnd: 1609298708,
    dueDate: 1611890708,
    currency: 'usd',
    amountPaid: 8900,
    amountDue: 10000,
    amountRemaining: 0,
    total: 90000,
    subtotal: 9000,
    defaultPaymentMethod: 'Master Card',
    invoicePdf:
      'https://pay.stripe.com/invoice/acct_14SJTOGlVGuVgOrk/invst_IfFo7ZObDS0WosDNKdA6ZlcEzZ4fDkS/pdf',
    lineItems: [
      {
        description: 'Unused time on 19 × users-pr-inappm after 30 Dec 2020',
        amount: -9449,
        currency: 'usd',
        period: { end: 1610473200, start: 1609298708 },
        value: 'users-pr-inappm',
        quantity: 19,
      },
      {
        description: null,
        amount: 72000,
        currency: 'usd',
        period: { end: 1640834708, start: 1609298708 },
        value: 'users-pr-inappy',
        quantity: 6,
      },
      {
        description: null,
        amount: 72000,
        currency: 'usd',
        period: { end: null, start: null },
        value: 'same period doesnt render date',
        quantity: 1,
      },
    ],
  }
}

const accountDetails = ({ collectionMethod = '' } = {}) => {
  return {
    subscriptionDetail: {
      collectionMethod,
      latestInvoice: mockInvoice(),
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
    activatedUserCount: 100,
  }
}

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/plan/gh/invoices/9']}>
    <Switch>
      <Route path="/plan/:provider/invoices/:id" exact>
        {children}
      </Route>
    </Switch>
  </MemoryRouter>
)

describe('Invoice Header', () => {
  describe('when rendered with receipt', () => {
    it('renders receipt details', () => {
      render(
        <InvoiceHeader
          invoice={mockInvoice()}
          accountDetails={accountDetails()}
        />,
        {
          wrapper,
        }
      )

      const title = screen.getAllByText(/Receipt/i)[0]
      expect(title).toBeInTheDocument()

      const invoiceNumber = screen.getByText(/CE3CEF02-0008/i)
      expect(invoiceNumber).toBeInTheDocument()

      const dateOfIssue = screen.getByText(/Date of issue/)
      expect(dateOfIssue).toBeInTheDocument()

      const dateDue = screen.getByText(/Date due/)
      expect(dateDue).toBeInTheDocument()

      const paymentMethod = screen.getByText(/Master Card/)
      expect(paymentMethod).toBeInTheDocument()

      const address = screen.getByText(/Beaverton, OR 97008-7105/)
      expect(address).toBeInTheDocument()

      const paidOn = screen.getByText(/December 30th 2020/)
      expect(paidOn).toBeInTheDocument()
    })
  })

  describe('when rendered with invoice', () => {
    it('renders receipt details', () => {
      render(
        <InvoiceHeader
          invoice={mockInvoice({ status: 'draft' })}
          accountDetails={accountDetails()}
        />,
        {
          wrapper,
        }
      )

      const title = screen.getAllByText(/Invoice/i)[0]
      expect(title).toBeInTheDocument()
    })
  })

  describe('when rendered for invoiced customers', () => {
    it('renders receipt details', () => {
      render(
        <InvoiceHeader
          invoice={mockInvoice()}
          accountDetails={accountDetails({ collectionMethod: 'send_invoice' })}
        />,
        {
          wrapper,
        }
      )

      const dueDate = screen.getByText(/January 29th, 2021/)
      expect(dueDate).toBeInTheDocument()
    })
  })
})
