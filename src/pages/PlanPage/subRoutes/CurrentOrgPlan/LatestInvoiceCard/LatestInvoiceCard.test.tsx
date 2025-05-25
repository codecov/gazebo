import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'
import { z } from 'zod'

import { InvoiceSchema } from 'services/account/useInvoices'

import LatestInvoiceCard from './LatestInvoiceCard'

const mocks = vi.hoisted(() => ({
  useInvoices: vi.fn(),
}))
vi.mock('services/account/useInvoices', async () => {
  const actual = await vi.importActual('services/account/useInvoices')
  return {
    ...actual,
    useInvoices: mocks.useInvoices,
  }
})

const invoice = {
  created: 1595270468,
  dueDate: 1600544863,
  total: 9600.0,
} as z.infer<typeof InvoiceSchema>

describe('LatestInvoiceCard', () => {
  function setup({ invoices }: { invoices: z.infer<typeof InvoiceSchema>[] }) {
    mocks.useInvoices.mockReturnValue({ data: invoices })

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

    it('renders the link to View all invoices', () => {
      const tab = screen.getByText(/View/)
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
