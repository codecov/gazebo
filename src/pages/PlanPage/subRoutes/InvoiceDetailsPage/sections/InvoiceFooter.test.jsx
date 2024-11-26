import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import { Plans } from 'shared/utils/billing'

import InvoiceFooter from './InvoiceFooter'

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

describe('Invoice Footer', () => {
  describe('when rendered', () => {
    it('renders the subtotal', () => {
      render(<InvoiceFooter invoice={invoice} />, {
        wrapper,
      })

      const subtotalLabel = screen.getByText(/Subtotal/)
      expect(subtotalLabel).toBeInTheDocument()

      const subtotal = screen.getByText(/\$90.00/)
      expect(subtotal).toBeInTheDocument()
    })

    it('renders the total', () => {
      render(<InvoiceFooter invoice={invoice} />, {
        wrapper,
      })

      const totalLabel = screen.getByText(/Total/)
      expect(totalLabel).toBeInTheDocument()

      const total = screen.getByText(/\$900.00/)
      expect(total).toBeInTheDocument()
    })

    it('renders the amount paid', () => {
      render(<InvoiceFooter invoice={invoice} />, {
        wrapper,
      })

      const amountPaidLabel = screen.getByText(/Amount paid/i)
      expect(amountPaidLabel).toBeInTheDocument()

      const amountPaid = screen.getByText(/\$89.00/i)
      expect(amountPaid).toBeInTheDocument()
    })

    it('renders the discount', () => {
      render(<InvoiceFooter invoice={invoice} />, {
        wrapper,
      })

      const discountLabel = screen.getByText(/Discount/i)
      expect(discountLabel).toBeInTheDocument()

      const discount = screen.getByText(/\$-10.00/i)
      expect(discount).toBeInTheDocument()
    })
  })
})
