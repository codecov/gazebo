import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import LatestInvoiceCard from './LatestInvoiceCard'

const invoice = {
  periodStart: 1595270468,
  dueDate: 1600544863,
  total: 9600.0,
  invoicePdf:
    'https://pay.stripe.com/invoice/acct_14SJTOGlVGuVgOrk/invst_Hs2qfFwArnp6AMjWPlwtyqqszoBzO3q/pdf',
}

describe('LatestInvoiceCard', () => {
  let wrapper
  function setup(invoice) {
    wrapper = render(<LatestInvoiceCard invoice={invoice} />, {
      wrapper: MemoryRouter,
    })
  }

  describe('when rendering with an invoice', () => {
    beforeEach(() => {
      setup(invoice)
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
      setup(null)
    })

    it('renders nothing', () => {
      expect(wrapper.container).toBeEmptyDOMElement()
    })
  })
})
