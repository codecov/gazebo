import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import { useInvoices } from 'services/account'

import LatestInvoiceCard from './LatestInvoiceCard'

jest.mock('services/account')

const invoice = {
  created: 1595270468,
  dueDate: 1600544863,
  total: 9600.0,
  invoicePdf:
    'https://pay.stripe.com/invoice/acct_14SJTOGlVGuVgOrk/invst_Hs2qfFwArnp6AMjWPlwtyqqszoBzO3q/pdf',
}

describe('LatestInvoiceCard', () => {
  function setup({ invoices }: { invoices: any }) {
    // TODO: figure out proper mock
    // @ts-expect-error
    useInvoices.mockReturnValue({ data: invoices })

    render(
      <MemoryRouter initialEntries={['/plan/gh/codecov']}>
        <Switch>
          <Route path="/plan/:provider/:owner" exact>
            <LatestInvoiceCard />
          </Route>
        </Switch>
      </MemoryRouter>
    )
  }

  describe('when rendering with an invoice', () => {
    beforeEach(() => {
      setup({ invoices: [invoice] })
    })

    it('renders the total of the invoice / 100', () => {
      const tab = screen.getByText(/\$96.00/)
      expect(tab).toBeInTheDocument()
    })

    it('renders the link to See All invoices', () => {
      const tab = screen.getByText(/See all invoices/)
      expect(tab).toBeInTheDocument()
    })
  })

  describe('when rendering with no invoice', () => {
    beforeEach(() => {
      setup({ invoices: [] })
    })

    it('renders nothing', () => {
      expect(screen.queryByText(/See all invoices/)).not.toBeInTheDocument()
    })
  })
})
