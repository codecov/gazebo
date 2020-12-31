import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useInvoices } from 'services/account'
import Invoices from './Invoices'

jest.mock('services/account/hooks')

const invoices = [
  {
    total: 2400,
    number: 1,
    created: 1607078662,
    dueDate: 1607078662,
    invoicePdf: '',
    status: 'draft',
  },
  {
    total: 2500,
    number: 2,
    created: 1604486662,
    dueDate: 1604486662,
    invoicePdf: '',
    status: 'open',
  },
  {
    total: 2600,
    number: 3,
    created: 1601808262,
    dueDate: 1601808262,
    invoicePdf: '',
    status: 'paid',
  },
  {
    total: 2700,
    number: 4,
    created: 1599216262,
    dueDate: 1599216262,
    invoicePdf: '',
    status: 'void',
  },
  {
    total: 2800,
    number: 5,
    created: 1596537862,
    dueDate: 1596537862,
    invoicePdf: '',
    status: 'uncollectible',
  },
  {
    total: 2900,
    number: 6,
    created: 1577764754,
    dueDate: 1577764754,
    invoicePdf: '',
    status: 'paid',
  },
  {
    total: 3000,
    number: 7,
    created: 1575172754,
    dueDate: 1575172754,
    invoicePdf: '',
    status: 'paid',
  },
]

describe('Invoices', () => {
  function setup() {
    useInvoices.mockReturnValue({ data: invoices })
    render(<Invoices owner="codecov" provider="codecov" />, {
      wrapper: MemoryRouter,
    })
  }

  describe('when rendering for', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the heading for the years', () => {
      expect(screen.getByRole('heading', { name: /2020/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /2019/i })).toBeInTheDocument()
    })

    it('renders the invoices', () => {
      expect(
        screen.getByText(/Invoice on December 4th 2020/)
      ).toBeInTheDocument()
      expect(screen.getByText(/\$24\.00/)).toBeInTheDocument()
    })
  })
})
