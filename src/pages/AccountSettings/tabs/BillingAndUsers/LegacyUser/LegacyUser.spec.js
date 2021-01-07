import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import LegacyUser from './LegacyUser'

jest.mock('../LatestInvoiceCard', () => () => 'LatestInvoiceCard')
jest.mock('../PaymentCard', () => () => 'PaymentCard')

const accountDetails = {
  nbActivePrivateRepos: 5,
  repoTotalCredits: 10,
  activatedUserCount: 0,
  inactiveUserCount: 0,
}

describe('LatestInvoiceCard', () => {
  function setup() {
    const props = {
      accountDetails,
      provider: 'gh',
      owner: 'Codecov',
    }
    render(<LegacyUser {...props} />, {
      wrapper: MemoryRouter,
    })
  }

  describe('when rendering', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the number of used repo / total', () => {
      const text = screen.getByText(/5\/10 Repositories used/)
      expect(text).toBeInTheDocument()
    })

    it('renders a link to support', () => {
      const link = screen.getByRole('link', { name: /contact support/i })
      expect(link).toBeInTheDocument()
    })

    it('renders a link to upgrade', () => {
      const link = screen.getByRole('link', {
        name: /upgrade to per user pricing/i,
      })
      expect(link).toBeInTheDocument()
    })

    it('renders the LatestInvoiceCard', () => {
      const tab = screen.getByText(/LatestInvoiceCard/)
      expect(tab).toBeInTheDocument()
    })

    it('renders the PaymentCard', () => {
      const tab = screen.getByText(/PaymentCard/)
      expect(tab).toBeInTheDocument()
    })
  })
})
