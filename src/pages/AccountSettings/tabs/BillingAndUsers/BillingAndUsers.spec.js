import { render, screen } from '@testing-library/react'

import BillingAndUsers from './BillingAndUsers'
import { useAccountDetails } from 'services/account'

jest.mock('./CurrentPlanCard', () => () => 'CurrentPlanCard')
jest.mock('./LatestInvoiceCard', () => () => 'LatestInvoiceCard')
jest.mock('./PaymentCard', () => () => 'PaymentCard')
jest.mock('./InfoMessageCancellation', () => () => 'InfoMessageCancellation')
jest.mock('./UserManagement', () => () => 'UserManagement')
jest.mock('./LegacyUpgrade', () => () => 'LegacyUpgrade')
jest.mock('services/account/hooks')

const provider = 'gh'
const owner = 'codecov'

describe('BillingAndUsersTab', () => {
  function setup(data = {}) {
    useAccountDetails.mockReturnValue({
      data,
    })
    render(<BillingAndUsers provider={provider} owner={owner} />)
  }

  describe('when rendering on base url', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the CurrentPlanCard', () => {
      const tab = screen.getByText(/CurrentPlanCard/)
      expect(tab).toBeInTheDocument()
    })

    it('renders the LatestInvoiceCard', () => {
      const tab = screen.getByText(/LatestInvoiceCard/)
      expect(tab).toBeInTheDocument()
    })

    it('renders the PaymentCard', () => {
      const tab = screen.getByText(/PaymentCard/)
      expect(tab).toBeInTheDocument()
    })

    it('renders the InfoMessageCancellation', () => {
      const tab = screen.getByText(/InfoMessageCancellation/)
      expect(tab).toBeInTheDocument()
    })
  })

  describe('legacy plan', () => {
    beforeEach(() => {
      setup(null)
    })

    it('renders the LegacyBillingPage is user is on old plan', () => {
      const tab = screen.getByText(/LegacyUpgrade/)
      expect(tab).toBeInTheDocument()
    })
  })
})
