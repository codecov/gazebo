import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import InvoiceItems from './InvoiceItems'

const invoice = {
  id: 'in_1I3vJAGlVGuVgOrk5h77hHRa',
  number: 'CE3CEF02-0008',
  status: 'paid',
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

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/plan/gh/invoices/9']}>
    <Switch>
      <Route path="/plan/:provider/invoices/:id" exact>
        {children}
      </Route>
    </Switch>
  </MemoryRouter>
)

describe('Invoice items', () => {
  describe('when rendered', () => {
    it('renders the description', () => {
      render(<InvoiceItems invoice={invoice} />, {
        wrapper,
      })

      const description = screen.getByText(/Description/)
      expect(description).toBeInTheDocument()

      const content = screen.getByText(
        /Unused time on 19 × users-pr-inappm after 30 Dec 2020/
      )
      expect(content).toBeInTheDocument()
    })

    it('renders the amount', () => {
      render(<InvoiceItems invoice={invoice} />, {
        wrapper,
      })

      const amount = screen.getByText(/Amount/)
      expect(amount).toBeInTheDocument()

      const total = screen.getByText(/\$-94.49/)
      expect(total).toBeInTheDocument()
    })
  })
})
