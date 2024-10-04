import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'
import { z } from 'zod'

import { InvoiceSchema } from 'services/account'

import InvoiceHeader from './InvoiceHeader'

const mockInvoice = ({ status = 'paid' } = {}) => {
  return {
    amountDue: 10000,
    amountPaid: 8900,
    created: 1609298708,
    currency: 'usd',
    customerAddress: null,
    customerEmail: null,
    customerName: null,
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
    dueDate: 1611890708,
    id: 'in_1I3vJAGlVGuVgOrk5h77hHRa',
    footer: null,
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
        // @ts-expect-error
        period: { end: null, start: null },
        value: 'same period doesnt render date',
        quantity: 1,
      },
    ],
    number: 'CE3CEF02-0008',
    periodEnd: 1609298708,
    periodStart: 1609298708,
    status,
    subtotal: 9000,
    taxIds: [{ value: 'CA BN 123456789' }],
    total: 90000,
  } as z.infer<typeof InvoiceSchema>
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
      customer: { id: 'cus_IVd2T7puVJe1Ur', email: '' },
    },
    activatedUserCount: 100,
  }
}

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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
          // @ts-expect-error
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

      const paymentMethod = screen.getByText(/Payment method/)
      expect(paymentMethod).toBeInTheDocument()

      const address = screen.getByText(/San Francisco, CA 94105/)
      expect(address).toBeInTheDocument()

      const paidOn = screen.getByText(/December 30th 2020/)
      expect(paidOn).toBeInTheDocument()

      const tax = screen.getByText(/CA BN 123456789/)
      expect(tax).toBeInTheDocument()
    })
  })

  describe('when rendered with invoice', () => {
    it('renders receipt details', () => {
      render(
        <InvoiceHeader
          invoice={mockInvoice({ status: 'draft' })}
          // @ts-expect-error
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
          // @ts-expect-error
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
